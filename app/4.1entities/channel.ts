import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne, EntitySchema} from "typeorm";
import { Content } from "./contents";
import { UserInfo } from "./userInfo";
import { Customer } from "./customer";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";


@Entity("channels")
export class Channel extends EntityBase{

    constructor(id?: number, channelName?: string, channelType?:string, isexternal?:boolean,baby?:string) {
        // this.Id = id==null?0: id;
        super();
        if(channelName!=null)
            this.ChannelName = channelName;
        else
            this.ChannelName = '';

        if(channelType!=null)
            this.ChannelType = channelType;
        else
            this.ChannelType = '';

        if(isexternal!=null)
            this.isExternal = isexternal;
        else
            this.isExternal = false;
            if(baby!=null)
            this.baby = baby;
        else
            this.baby = '';
        // this.user = new UserInfo();
        // this.Content = new Content();
    }

    // @PrimaryGeneratedColumn()
    // Id: number;

    @Column({name:"channel_name",nullable:true})
    ChannelName: string;

    @Column({name:"channel_type",nullable:true})
    ChannelType: string;

    @Column({name:"baby",nullable:true})
    baby: string;

    @Column({name:"is_external",nullable:true})
    isExternal: boolean;

    @ManyToOne(type => UserInfo, user => user.channels)
    user?: UserInfo;

    @ManyToOne(type=>Customer, customer=>customer.channel)
    customer?:Customer;
}
