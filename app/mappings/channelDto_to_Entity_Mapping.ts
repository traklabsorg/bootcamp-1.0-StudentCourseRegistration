// import { ChannelDto } from "../3.1 dtos/channelDto";
import { ChannelDto } from "../3.1-dtos/3.1 dtos/channelDto";
import { Channel } from "../4.1entities/channel";

var objectMapper = require('object-mapper');

export class ChannelDtoEntityMapper{

    MapDtoToEntity(channelDto:ChannelDto):Channel{

        //Read the properties whcih are of same name , do mapping using Object.Keys and Object,Values using recursion

        let map = {
            "ChannelName2":"ChannelName",
            "Content":"Content.ContentName"
        };

        let dest = objectMapper(channelDto, map);
        console.log(dest);
        
        return dest;
    }

    MapEntitytoDto(channel:Channel[]):ChannelDto{

        // let channelDto = new ChannelDto();
        //Read the properties whcih are of same name , do mapping using Object.Keys and Object,Values using recursion
        
        let map = {
            "ChannelName":"ChannelName2",
            "Content.ContentName":"Content"
        };
        
        var dest = objectMapper(channel, map);
        console.log(dest);
        
        return dest;
    }
}



        // let keys = Object.keys(channelDto);
        // let values = Object.values(channelDto);

        // let keys_entities = Object.keys(channel);
       
        // let iCount=0;

//         keys.forEach(item=>{

//             //check for object, do recursion

//             //check for array , do recursion

//             //if not object and not array proper normally
//             if(keys_entities.includes(item)){
//                 channel[item] = values[iCount];
//             }
            
// //npm install --save object-mapper
//             iCount++;
//         });
