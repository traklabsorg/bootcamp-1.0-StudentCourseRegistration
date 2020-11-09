
export class Page{
    private PageSize:number;
    private PageNumber:number;
    private TotalRecords:number;
    private CurrentPage:number;

    constructor(pageSize:number,pageNumber:number,totalRecords:number,currentPage:number){
        this.PageSize = pageSize;
        this.PageNumber = pageNumber;
        this.TotalRecords = totalRecords;
        this.CurrentPage = currentPage;
    }
}