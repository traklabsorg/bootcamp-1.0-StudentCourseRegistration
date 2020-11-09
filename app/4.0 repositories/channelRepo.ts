
//all necessary methods

/*
CREATE
READ
UPDATE
DELETE


//Define relationship between different entities

1- 1
1- M
*/

import {createConnection} from "typeorm";
// import {ResponseModel} from "../../framework/entities/responseModel";
import {Channel} from "../4.1entities/channel";
// import {ChannelDto} from "../3.1 dtos/channelDto";
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Channel)
export class ChannelRepository extends Repository<Channel>{


    async get():Promise<[Channel] | null>{
        let result = createConnection( /*...*/).then(async (connection) => {
            /*...*/
            let channelRepository = connection.getRepository(Channel);

            let allPublishedChannels = await channelRepository.find();
            console.log("All published channels: ", allPublishedChannels);
            let [allChannels, count] = await channelRepository.findAndCount();
            console.log("All channels: ", allChannels);
            console.log("Channels count: ", count);
            return allChannels;
        }).catch(error => console.log(error));

        return null;
    }

}
