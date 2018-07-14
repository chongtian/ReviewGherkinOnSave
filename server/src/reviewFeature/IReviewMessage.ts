export interface IReviewMessage{
    line:number;
    type:number; //0-information, 1-warning, 2-error, 3-fatal error
    message:string;
}