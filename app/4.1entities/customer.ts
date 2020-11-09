import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";
import { Channel } from "./channel";
import { Subscriptions } from "./subscription";


@Entity('customers')
export class Customer extends EntityBase{

    constructor(id?: number) {
        super();
        // this.Id = id==null?0: id;
        this.CompanyName="abcd";
        this.BillingAddress = "";
        this.Country = "India";
        this.isActive = true;
    }

    @Column({name:"company_name",nullable:true})
    CompanyName: string;

    @Column({name:"billing_address",nullable:true})
    BillingAddress: string;
    
    @Column({name:"country",nullable:true})
    Country : string ;

    @Column({name:"is_active",nullable:true})
    isActive: boolean;

    @OneToMany(type=>Subscriptions,subscription=>subscription.customer)
    subscription?:Subscriptions[];

    @OneToMany(type=>Channel,channel=>channel.customer)
    channel?:Channel[];
}