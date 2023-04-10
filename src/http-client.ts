import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export class HTTPClient {
    private readonly url: string
    private readonly clientId: string
    private readonly clientSecret: string
    readonly application: string | null
    private accessToken?: string
    private expiryDate: Date

    constructor(config: any) {
        this.url = config.url
        this.clientId = config.clientId
        this.clientSecret = config.clientSecret
        this.expiryDate = new Date()
        this.application = config.application
    }

    async getAccessToken(): Promise<string | undefined> {
        if (new Date() >= this.expiryDate) {
            const request: AxiosRequestConfig = {
                method: 'post',
                baseURL: this.url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
                // data: {
                //     client_id: this.clientId,
                //     client_secret: this.clientSecret,
                //     grant_type: 'client_credentials',
                // },
                url: '/oauth2/access_token',
            }
            const response: AxiosResponse = await axios(request)
            this.accessToken = response.data.access_token
            this.expiryDate = new Date()
            this.expiryDate.setSeconds(this.expiryDate.getSeconds() + response.data.expires_in)
        }

        return this.accessToken
    }

    async testConnection(): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: '/system/users',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }

        return axios(request)
    }

    async getAccounts(): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()
        const path = 'users'

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/${path}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails,Authentication',
                $select: 'userId,name,firstName,status',
                $top: '50',
            },
        }

        let data: any[] = []
        let finished = false

        let response = await axios(request)
        data = [...data, ...response.data[path]]

        while (!finished) {
            const nextPageKey = response.data.paging.nextPageKey
            if (nextPageKey) {
                request.params['$pageKey'] = nextPageKey
                response = await axios(request)
            } else {
                finished = true
            }
            data = [...data, ...response.data[path]]
        }
        response.data = data
        return response
    }

    async getAccount(id: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/users/${id}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails,Authentication',
                $select: 'userId,name,firstName,status',
            },
        }

        let response = await axios(request)

        return response
    }

    async getRoles(): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()
        const path = 'roles'

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/${path}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails',
                $top: '50',
            },
        }

        let data: any[] = []
        let finished = false

        let response = await axios(request)
        data = [...data, ...response.data[path]]

        while (!finished) {
            const nextPageKey = response.data.paging.nextPageKey
            if (nextPageKey) {
                request.params['$pageKey'] = nextPageKey
                response = await axios(request)
            } else {
                finished = true
            }
            data = [...data, ...response.data[path]]
        }
        response.data = data
        return response
    }

    async getRole(id: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/roles/${id}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails',
            },
        }

        let response = await axios(request)

        return response
    }

    async getPermissions(): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()
        const path = 'permissions'

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/${path}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails',
                $top: '50',
            },
        }

        let data: any[] = []
        let finished = false

        let response = await axios(request)
        data = [...data, ...response.data[path]]

        while (!finished) {
            const nextPageKey = response.data.paging.nextPageKey
            if (nextPageKey) {
                request.params['$pageKey'] = nextPageKey
                response = await axios(request)
            } else {
                finished = true
            }
            data = [...data, ...response.data[path]]
        }
        response.data = data
        return response
    }

    async getUserRoles(userId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()
        const path = 'userAssignments'

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: '/system/roles/user-assignments',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails',
                $filter: `UserId eq ${userId}`,
                $top: '50',
            },
        }

        let data: any[] = []
        let finished = false

        let response = await axios(request)
        data = [...data, ...response.data[path]]

        while (!finished) {
            const nextPageKey = response.data.paging.nextPageKey
            if (nextPageKey) {
                request.params['$pageKey'] = nextPageKey
                response = await axios(request)
            } else {
                finished = true
            }
            data = [...data, ...response.data[path]]
        }
        response.data = data
        return response
    }

    async getRoleUserAssignments(roleId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()
        const path = 'userAssignments'

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/roles/${roleId}/user-assignments`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails',
                $top: '50',
            },
        }

        let data: any[] = []
        let finished = false

        let response = await axios(request)
        data = [...data, ...response.data[path]]

        while (!finished) {
            const nextPageKey = response.data.paging.nextPageKey
            if (nextPageKey) {
                request.params['$pageKey'] = nextPageKey
                response = await axios(request)
            } else {
                finished = true
            }
            data = [...data, ...response.data[path]]
        }
        response.data = data
        return response
    }

    async removeRoleUserAssignment(roleId: string, userAssignmentId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'post',
            baseURL: this.url,
            url: `/system/roles/${roleId}/user-assignments/${userAssignmentId}/api-operations/100121/instances`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        }

        return await axios(request)
    }

    async getRoleDuties(roleId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()
        const path = 'duties'

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/roles/${roleId}/duties`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails',
                $top: '50',
            },
        }

        let data: any[] = []
        let finished = false

        let response = await axios(request)
        data = [...data, ...response.data[path]]

        while (!finished) {
            const nextPageKey = response.data.paging.nextPageKey
            if (nextPageKey) {
                request.params['$pageKey'] = nextPageKey
                response = await axios(request)
            } else {
                finished = true
            }
            data = [...data, ...response.data[path]]
        }
        response.data = data
        return response
    }

    async getDutyPrivileges(dutyId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()
        const path = 'privileges'

        let request: AxiosRequestConfig = {
            method: 'get',
            baseURL: this.url,
            url: `/system/duties/${dutyId}/${path}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            params: {
                $expand: 'PagingDetails',
                $top: '50',
            },
        }

        let data: any[] = []
        let finished = false

        let response = await axios(request)
        data = [...data, ...response.data[path]]

        while (!finished) {
            const nextPageKey = response.data.paging.nextPageKey
            if (nextPageKey) {
                request.params['$pageKey'] = nextPageKey
                response = await axios(request)
            } else {
                finished = true
            }
            data = [...data, ...response.data[path]]
        }
        response.data = data
        return response
    }

    async assignRole(roleId: string, userId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'post',
            baseURL: this.url,
            url: `/system/roles/${roleId}/user-assignments`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            data: {
                userAssignment: {
                    comment: 'Provisioned by IdentityNow',
                    user: {
                        userId: userId,
                    },
                },
            },
        }

        return await axios(request)
    }

    async createAccount(
        username: string,
        firstName: string,
        lastName: string,
        email: string,
        phone: string
    ): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'post',
            baseURL: this.url,
            url: '/system/users',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data: {
                user: {
                    firstName: firstName,
                    name: lastName,
                    authentication: {
                        username: username,
                        oneTimePassword: {
                            mobilePhone: phone,
                            email: email,
                        },
                    },
                },
            },
        }

        return await axios(request)
    }

    async enableAccount(userId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'post',
            baseURL: this.url,
            url: `/system/users/${userId}/api-operations/100771/instances`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }

        return await axios(request)
    }

    async disableAccount(userId: string): Promise<AxiosResponse> {
        const accessToken = await this.getAccessToken()

        let request: AxiosRequestConfig = {
            method: 'post',
            baseURL: this.url,
            url: `/system/users/${userId}/api-operations/100758/instances`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }

        return await axios(request)
    }
}
