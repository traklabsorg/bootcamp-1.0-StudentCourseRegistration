import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";
import { IsEmail, IsNotEmpty, Length } from "class-validator";
import {Channel} from './channel';
import { GroupUsers } from "./groupUser";
import { group } from "console";

@Entity('userInfos')
export class UserInfo extends EntityBase{

    constructor(password?:string, country?:string, firstName?:string, email?:string,lastName?:string, mobile?:number, address?:string, isActive?:boolean,) {
        super();
        // this.Id = id==null?0: id;

        if(firstName!=null)
            this.FirstName = firstName;
        else
            this.FirstName = '';


        if(lastName!=null)
            this.LastName = lastName;
        else
            this.LastName = '';        
        
        if(mobile!=null)
            this.Mobile = mobile;
        else
            this.Mobile = 0;
        
        if(address!=null)
            this.Address = address;
        else
            this.Address = '';

        if(isActive!=null)
            this.isActive = isActive;
        else
            this.isActive = false;

        if(email!=null)
            this.Email = email;
        else
            this.Email = '';

        if(password!=null)
            this.password = password;
        else
            this.password = 'random123';

        if(country!=null)
            this.Country = country;
        else
            this.Country = 'Taiwan';

    }

    // @PrimaryGeneratedColumn()
    // Id: number;

    @Column({name:"first_name",nullable:true})
    FirstName: string;

    @Column({name:"last_name",nullable:true})
    LastName: string;

    @Column({name:"mobile",nullable:true})
    Mobile: number;

    @Column({ name: 'email',nullable:true })
    @IsEmail({}, { message: 'Incorrect email' })
    @IsNotEmpty({ message: 'The email is required' })
    Email!: string;

    @Column({name:"password",nullable:true})
    @Length(6, 30, { message: 'The password must be at least 6 but not longer than 30 characters' })
    @IsNotEmpty({ message: 'The password is required' })
    password!: string;

    @Column({name:"is_active",nullable:true})
    isActive: boolean;

    @Column({name:"address",nullable:true})
    Address: string;

    @Column({name:"country",nullable:true})
    Country: string;

    @OneToMany(type => Channel, channel => channel.user)
    channels?: Channel[];

    @OneToMany(type=> GroupUsers, group_user => group_user.user)
    group_user?: GroupUsers[];
}