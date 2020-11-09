import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";
import { GroupUsers } from "./groupUser";


@Entity('groups')
export class Group extends EntityBase{

    constructor(id?: number, groupName?:string, groupDescription?:string, isActive?:boolean) {
        super();
        // this.Id = id==null?0: id;
        if(groupName!=null)
            this.GroupName = groupName;
        else
            this.GroupName = "";

        if(groupDescription!=null)
            this.GroupDescription = groupDescription;
        else
            this.GroupDescription = "";

        if(isActive!=null)
            this.isActive = isActive;
        else
            this.isActive = false;
    }

    // @PrimaryGeneratedColumn()
    // Id: number;
    @Column({name:"group_name",nullable:true})
    GroupName: string;

    @Column({name:"group_description",nullable:true})
    GroupDescription: string;

    @Column("bytea",{nullable:false})
    GroupImage?: Buffer;

    @Column({name:"is_active",nullable:true})
    isActive:boolean;

    @OneToMany(type=>GroupUsers,group_user=>group_user.group)
    group_users?:GroupUsers[];
}


// @Column("blob", { nullable: true })
// content: Blob;