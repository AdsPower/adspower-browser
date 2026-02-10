export interface CreateGroupParams {
    groupName: string;
    remark?: string;
}

export interface UpdateGroupParams {
    groupId: string;
    groupName: string;
    remark?: string | null;
}

export interface GetGroupListParams {
    groupName?: string;
    size?: number;
    page?: number;
}
