import { Attributes, StdAccountReadOutput } from '@sailpoint/connector-sdk'

const status: { [index: number]: string } = {
    1: 'Edit',
    2: 'Invited',
    4: 'Active',
    7: 'Temporary leave',
    9: 'Inactive',
}

export class Account {
    identity: string
    uuid: string
    attributes: Attributes

    constructor(object: any) {
        this.attributes = {
            id: (object.userId as number).toString(),
            username: object.authentication.username,
            firstName: object.firstName,
            lastName: object.name,
            displayName: `${object.firstName} ${object.name}`,
            email: object.authentication.oneTimePassword.email,
            phone: object.authentication.oneTimePassword.mobilePhone,
            status: status[object.status as number],
        }
        this.identity = this.attributes.id as string
        this.uuid = this.attributes.displayName as string
    }
}
