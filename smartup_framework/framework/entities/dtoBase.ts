// import {Entity, Column,PrimaryColumn, CreateDateColumn, Timestamp, VersionColumn} from "typeorm";
// import {PrimaryGeneratedColumn} from "typeorm";


export class DtoBase {

    constructor() {
        // this.Id = 0;
        // this.ModifiedBy= 0;
        // this.CreatedBy = 0;
        // this.AutoOffset = 0;
        // this.RowVersion = 0; // new Buffer("abc");
        this.CreationDate = new Date(); 
        this.ModifiedDate = new Date();
        // this.EntityState = 0;
    }

    //let date = new Date(); //gives current date in date format
    // @PrimaryGeneratedColumn({name:'id'})
    // Id: number;

    // @CreateDateColumn({name:'creation_date',nullable:false, type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    CreationDate: Date;

    // @CreateDateColumn({name:'modified_date', type: "timestamp with time zone", nullable: true , default: () => "CURRENT_TIMESTAMP" })
    ModifiedDate: Date;

    // @Column({name:'created_by',nullable:true})
    // CreatedBy: number;

    // // @Column({name:'modified_by',nullable: true })
    // ModifiedBy: number;

    // // @VersionColumn({name:'row_version',nullable: true}) //({ type: "bytea", nullable: true })
    // RowVersion: number;
    
    // // @Column({name:'auto_offset',type: 'integer',nullable:true})
    // AutoOffset: number;

    // EntityState: number;      // 1 = create, 2 = update, 3 = delete,  0 = unchanged
}
