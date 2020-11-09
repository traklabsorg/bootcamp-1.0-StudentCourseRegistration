import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";
import { Subscriptions } from "./subscription";


@Entity('plans')
export class Plans extends EntityBase{

    constructor(id?: number) {
        super();
        // this.Id = id==null?0: id;
        this.PlanType = "";
        this.PlanName = "";
        this.PlanDuration = 0;
        this.PlanDefaultPrice = 0;
        this.PlanCurrency = "$";
    }

    @Column({name:"plan_type",nullable:true})
    PlanType: string;

    @Column({name:"plan_name",nullable:true})
    PlanName: string;

    @Column({name:"plan_duration",nullable:true})
    PlanDuration: number;

    @Column({name:"plan_default_price",nullable:true})
    PlanDefaultPrice: number;

    @Column({name:"plan_currency",nullable:true})
    PlanCurrency: string;

    @OneToOne(type => Subscriptions, subscription => subscription.plan)
    @JoinColumn()
    subscription!: Subscriptions;
}