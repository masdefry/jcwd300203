export interface IGetPropertyList {
    parsedCheckIn: Date | undefined;
    parsedCheckOut: Date | undefined;
    search: string | undefined; 
    guest: string | undefined;
    sortBy: string;
    sortOrder: string;
    offset: number;
    pageSize: number;
}