import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn,CreateDateColumn, Table} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";

@Entity({name:"coupons"})
export class Coupon extends EntityBase{

    constructor(id?: number) {
        super();
        // this.Id = id==null?0: id;
        this.ValidTill = new Date();
        this.UsageCount = 0;
        this.Description = "";
        this.MaxUsage = 0;
        this.Status = "";
        this.CouponType = "Discount";
        this.CouponCode = "abcd";
    }

    @CreateDateColumn({name:'valid_till',nullable:true, type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    ValidTill: Date;

    @Column({name:"usage_count",nullable:true})
    UsageCount : number;

    @Column({name:"description",nullable:true})
    Description : string;

    @Column({name:"max_usage",nullable:true})
    MaxUsage : number; 

    @Column({name:"status",nullable:true})
    Status: string;

    @Column({name:"coupon_type",nullable:true})
    CouponType: string;

    @Column({name:"coupon_code",nullable:true})
    CouponCode: string;
}