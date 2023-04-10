import { AxiosResponse } from 'axios'
import {
    Context,
    ConnectorError,
    createConnector,
    readConfig,
    logger,
    Response,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    StdEntitlementListOutput,
    StdEntitlementReadOutput,
    StdEntitlementReadInput,
    StdTestConnectionOutput,
    AttributeChangeOp,
} from '@sailpoint/connector-sdk'
import { HTTPClient } from './http-client'
import { Account } from './model/account'
import { Group } from './model/group'

// Connector must be exported as module property named connector
export const connector = async () => {
    // Get connector source config
    const config = await readConfig()

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const client = new HTTPClient(config)

    const readAccount = async (id: string): Promise<Account> => {
        const response1: AxiosResponse = await client.getAccount(id)
        let account: Account = new Account(response1.data.user)
        const response2: AxiosResponse = await client.getUserRoles(account.identity)
        const roles = new Set<string>(response2.data.map((x: { role: { roleId: any } }) => x.role.roleId))
        account.attributes.roles = Array.from(roles)
        return account
    }

    return createConnector()
        .stdTestConnection(async (context: Context, input: undefined, res: Response<StdTestConnectionOutput>) => {
            const response: AxiosResponse = await client.testConnection()
            if (response.status != 200) {
                throw new ConnectorError('Unable to connect to RamBase')
            } else {
                logger.info('Test successful!')
                res.send({})
            }
        })
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            const response1: AxiosResponse = await client.getAccounts()
            for (const acc of response1.data) {
                const account: Account = new Account(acc)
                const response2: AxiosResponse = await client.getUserRoles(account.identity)
                const roles = new Set<string>(
                    response2.data.map((x: { role: { roleId: any } }) => x.role.roleId as string)
                )
                account.attributes.roles = Array.from(roles)

                logger.info(account)
                res.send(account)
            }
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            logger.info(input)
            const account = await readAccount(input.identity)

            logger.info(account)
            res.send(account)
        })
        .stdAccountCreate(
            async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
                logger.info(input)
                const { username, firstName, lastName, email, phone, roles } = input.attributes
                const response = await client.createAccount(username, firstName, lastName, email, phone)
                for (const role of [].concat(roles)) {
                    await client.assignRole(role, response.data.user.userId)
                }
                const account = await readAccount(response.data.user.userId)

                logger.info(account)
                res.send(account)
            }
        )
        .stdAccountDisable(async (context: Context, input: any, res: Response<any>) => {
            logger.info(input)
            await client.disableAccount(input.identity)
            const account = await readAccount(input.identity)

            logger.info(account)
            res.send(account)
        })
        .stdAccountEnable(async (context: Context, input: any, res: Response<any>) => {
            logger.info(input)
            await client.enableAccount(input.identity)
            const account = await readAccount(input.identity)

            logger.info(account)
            res.send(account)
        })
        .stdAccountUpdate(
            async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
                logger.info(input)
                for (const change of input.changes) {
                    const values = [].concat(change.value)
                    for (const value of values) {
                        switch (change.op) {
                            case AttributeChangeOp.Add:
                                await client.assignRole(value, input.identity)
                                break
                            case AttributeChangeOp.Remove:
                                const response1 = await client.getRoleUserAssignments(value)
                                const userAssignment = response1.data.filter(
                                    (x: { user: { userId: string } }) => x.user.userId == input.identity
                                )
                                for (let assignment of userAssignment) {
                                    await client.removeRoleUserAssignment(value, assignment.userAssignmentId)
                                }
                                break
                            default:
                                throw new ConnectorError(`Operation not supported: ${change.op}`)
                        }
                    }
                }

                const account = await readAccount(input.identity)

                logger.info(account)
                res.send(account)
            }
        )
        .stdEntitlementList(async (context: Context, input: any, res: Response<StdEntitlementListOutput>) => {
            const response1 = await client.getRoles()
            for (const gr of response1.data) {
                const group: Group = new Group(gr)
                const response2 = await client.getRoleDuties(group.identity)
                const duties = new Set<string>(response2.data.map((x: { name: string }) => x.name))
                group.attributes.duties = Array.from(duties).sort()
                const dutyIds = response2.data.map((x: { dutyId: any }) => x.dutyId)
                if (config.includePermissions) {
                    const permissions = new Set<string>()
                    for (const duty of dutyIds) {
                        const response3 = await client.getDutyPrivileges(duty)
                        for (const privilege of response3.data) {
                            permissions.add(privilege.permission.name)
                        }
                    }
                    group.attributes.permissions = Array.from(permissions).sort()
                }

                logger.info(group)
                res.send(group)
            }
        })
        .stdEntitlementRead(
            async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
                logger.info(input)
                const response1 = await client.getRole(input.identity)
                const group: Group = new Group(response1.data.role)
                const response2 = await client.getRoleDuties(group.identity)
                const duties = Array.from(response2.data.map((x: { name: string }) => x.name)).sort() as string[]
                group.attributes.duties = duties
                const dutyIds = response2.data.map((x: { id: string }) => x.id)
                if (config.includePermissions) {
                    const permissions = new Set()
                    for (const duty of dutyIds) {
                        const response3 = await client.getDutyPrivileges(duty)
                        for (const privilege of response3.data) {
                            permissions.add(privilege.permission.name)
                        }
                    }
                    group.attributes.permissions = Array.from(permissions).sort() as string[]
                }

                logger.info(group)
                res.send(group)
            }
        )
}
