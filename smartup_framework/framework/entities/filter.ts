import {Page} from "./page";
import {Condition} from "./condition";

export class Filter{

    private OrderByField!: string;
    private IsOrderByFieldAsc!: boolean;
    private Conditions: Array<Condition>;
    private PageInfo!:Page;

    public getConditions(): Array<Condition> {
		return this.Conditions;
	}

	public setConditions(value: Array<Condition>) {
		this.Conditions = value;
    }
    
    constructor(){
        this.IsOrderByFieldAsc = false;
        this.Conditions = new Array<Condition>();
    }
}