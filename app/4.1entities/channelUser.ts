import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn} from "typeorm";
import { EntityBase } from "../../smartup_framework/framework/entities/enitityBase";


@Entity('channelUsers')
export class ChannelUsers extends EntityBase{

    constructor(id?: number) {
        super();
        // this.Id = id==null?0: id;
    }

    // @PrimaryGeneratedColumn()
    // Id: number;
}
