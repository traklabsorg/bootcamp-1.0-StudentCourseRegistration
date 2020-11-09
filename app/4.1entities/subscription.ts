import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, CreateDateColumn, ManyToOne} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";
import { Customer } from "./customer";
import { Plans } from "./plan";


@Entity('subscriptions')
export class Subscriptions extends EntityBase{

    constructor(id?: number) {
        super();
        // this.Id = id==null?0: id;
        this.StartDate = new Date();
        this.EndDate = new Date();
        this.TransactionDate = new Date();
        this.isAutoRenew = false;
        this.isActive = false;
        this.SubscriptionType = "";
    }

    @CreateDateColumn({name:'start_date',nullable:true, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    StartDate: Date;

    @CreateDateColumn({name:'end_date',nullable:true, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    EndDate: Date;

    @CreateDateColumn({name:'transaction_date',nullable:true, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    TransactionDate: Date;

    @Column({name:"is_auto_renew",nullable:true})
    isAutoRenew : boolean;

    @Column({name:"is_active",nullable:true})
    isActive : boolean;

    @Column({name:"subscription_type",nullable:true})
    SubscriptionType: string;

    @ManyToOne(type=>Customer, customer=>customer.subscription)
    customer?:Customer;

    @OneToOne(type => Plans, plan => plan.subscription)
    plan!: Plans;
}