import { Exclude } from "class-transformer";
import {Entity, Column,PrimaryColumn, CreateDateColumn, Timestamp, VersionColumn} from "typeorm";
import {PrimaryGeneratedColumn} from "typeorm";
import { isNotEmittedStatement } from "typescript";

@Entity()
export class EntityBase {
    //Id:number;

    constructor() {
        this.Id = 0;
        this.ModifiedBy= 0;
        this.CreatedBy = 0;
        this.AutoOffset = 0;
        this.RowVersion = 0; // new Buffer("abc");
        this.CreationDate = new Date(); 
        this.ModifiedDate = new Date();
        this.EntityState = 0;
    }

    //let date = new Date(); //gives current date in date format
    @PrimaryGeneratedColumn({name:'id'})
    Id: number;

    @CreateDateColumn({name:'creation_date',nullable:false, type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    CreationDate: Date;

    @CreateDateColumn({name:'modified_date', type: "timestamp with time zone", nullable: true , default: () => "CURRENT_TIMESTAMP" })
    ModifiedDate: Date;

    @Column({name:'created_by',nullable:true})
    CreatedBy: number;

    @Column({name:'modified_by',nullable: true })
    ModifiedBy: number;

    @VersionColumn({name:'row_version',nullable: false, }) //({ type: "bytea", nullable: true })
    RowVersion: number;
    
    @Exclude({toClassOnly:true})
   // @Column({name:'auto_offset',type: 'integer',nullable:true})
    AutoOffset: number;

    @Exclude({toClassOnly:true})
    //@Column({select:false})
    EntityState: number;    // 1 = create, 2 = update, 3 = delete,  0 = unchanged
}
/*
  Group
     GroupUsers[
      {
        GroupId:1,
        UserId:2,
        EntityState:3,
        RowVersion:100
      },
      {
        GroupId:2,
        UserId:2,
        EntityState:2,
        RowVersion:101
      },
       {
        GroupId:3,
        UserId:3,
        EntityState:0,
        RowVersion:102
      },
       {
        GroupId:31,
        UserId:31,
        EntityState:1,
        RowVersion:0
      }
     
     ]

*/