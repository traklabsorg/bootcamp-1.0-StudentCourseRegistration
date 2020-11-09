import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";
import { Group } from "./group";
import { UserInfo } from "./userInfo";


@Entity('groupUsers')
export class GroupUsers extends EntityBase{

    constructor(id?: number, isActive?:boolean) {
        super();
        
        if(isActive!=null)
            this.isActive = isActive;
        else
            this.isActive = false;
        // this.Id = id==null?0: id;
        this.UserId=0;
        this.GroupId=0;
    }

    // @PrimaryGeneratedColumn()
    // Id: number;
    @Column({name:'user_id',type: 'integer',nullable:true})
    UserId: number;

    @Column({name:'group_id',type: 'integer',nullable:true})
    GroupId: number;

    @Column({name:"is_active",nullable:true})
    isActive:boolean;

    @ManyToOne(type => UserInfo, user => user.group_user)
    @JoinColumn({name: "user_id"})
    user?: UserInfo;

    @ManyToOne(type=>Group, group=>group.group_users)
    @JoinColumn({name: "group_id"})
    group?:Group;
}

// @JoinColumn({ name: "FirstName"})