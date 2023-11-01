export interface IAcceptFriendRequestData extends IBaseFriendRequest
{

}

export interface ICancelFriendRequestData extends IBaseFriendRequest
{

}

export interface IBaseFriendRequest
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    request_id: string
}
