-- FUNCTION: public.fn_add_channels_group(integer, integer, integer)

-- DROP FUNCTION public.fn_add_channels_group(integer, integer, integer);

CREATE OR REPLACE FUNCTION public.fn_add_channels_group(
	in_community_id integer,
	in_channel_id integer,
	in_group_id integer)
    RETURNS TABLE(id integer, creation_date timestamp with time zone, created_by integer, row_version integer, channel_id integer, group_id integer, channel_group_revoke_users json) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE 
 
  p_total_records integer;
  p_status_json json;
  p_revoke_list_json_array json;
  p_last_inserted_id integer;
  p_channel_group_id integer;
  	   
BEGIN
	/* USAGE 
		SELECT * from public.fn_add_channels_group(1, 11, 1)

		--FOR EXISTING CASES
		SELECT * from public.fn_add_channels_group(1, 1, 1)
		
		--FOR NEW CASES
		SELECT * from public.fn_add_channels_group(1, 1, 2)
		
		select * from public.groups where id not in (select channel_groups.group_id from public."channelGroups" channel_groups)

		--select * from public."channelGroups"
		--delete from public."channelGroups" where id = 5
		--SELECT '[]'::json
		
	*/
	
	p_last_inserted_id:= 0;
	p_revoke_list_json_array:= null;
	
	--RAISE NOTICE 'Recevied the Response %', in_channel_user_additional_details;
	
	CREATE TEMPORARY  TABLE IF NOT EXISTS  TEMP_CHANNEL_GROUPS_ADDED 
	(
			id integer,
			creation_date timestamp with time zone, 
			created_by integer,
			row_version integer, 
			channel_id integer, 
			group_id integer, 
			channel_group_revoke_users json
	  ) ON COMMIT DELETE ROWS;
	
	--*********** SETTING THE ID FROM Channel-Group for existing users *********************
	p_channel_group_id:= ( SELECT channel_groups.id from 
			   public."channelGroups" channel_groups
				JOIN public.channels channels ON (channels.id = channel_groups.channel_id)
				JOIN public.communities communities ON (communities.id = channels.community_id)
			   --JOIN public."groupUsers" group_users ON (group_users.group_id = channel_groups.group_id)
			   WHERE channel_groups.channel_id = in_channel_id 
			   	--AND group_users.group_id = in_group_id
			   and channel_groups.group_id = in_group_id
						  LIMIT 1) ;
			  
	
	--*********** CHECK IF THE COMBINATION ALREADY EXISTS IN CHANNEL-GROUPS AS 'REVOKED-USER' THEN REMOVE THE REVOKE LIST FROM CHANNEL-GROUPS ******
	IF (p_channel_group_id is not null and p_channel_group_id > 0) 
		THEN
		
		--**************** CLEAR THE CHANNEL-GROUP'S REVOKE LIST ******************************
		UPDATE 
			 public."channelGroups" 
		SET 
			channel_group_revoke_users = '[]'::json
		WHERE 
			public."channelGroups".channel_id = in_channel_id
			AND
			public."channelGroups".group_id = in_group_id
		;
		
		INSERT INTO TEMP_CHANNEL_GROUPS_ADDED
			(id, creation_date, created_by,row_version, channel_id, group_id, channel_group_revoke_users)
		SELECT 
			channel_groups.id ,
			channel_groups.creation_date , 
			channel_groups.created_by ,
			channel_groups.row_version , 
			channel_groups.channel_id , 
			channel_groups.group_id , 
			channel_groups.channel_group_revoke_users  
		FROM public."channelGroups" channel_groups 
		Where channel_groups.id = p_channel_group_id;
	ELSE
		--**************** INSERT INTO CHANNEL-GROUPS *******************//
		INSERT INTO public."channelGroups" (creation_date, created_by, row_version,  channel_id, group_id, 
												channel_group_revoke_users)
			VALUES (CURRENT_TIMESTAMP, 1, 1,in_channel_id, in_group_id, '[]'::json)
		RETURNING *
			INTO STRICT p_last_inserted_id
		;
		
	
		
		INSERT INTO TEMP_CHANNEL_GROUPS_ADDED
			(id, creation_date, created_by,row_version,  channel_id, group_id, channel_group_revoke_users)
		SELECT 
			channel_groups.id ,
			channel_groups.creation_date , 
			channel_groups.created_by ,
			channel_groups.row_version , 
			channel_groups.channel_id , 
			channel_groups.group_id , 
			channel_groups.channel_group_revoke_users  
		FROM public."channelGroups" channel_groups 
		Where channel_groups.id = p_last_inserted_id;
	
	END IF;
		
		
	RETURN QUERY
		SELECT 
			channel_groups.id ,
			channel_groups.creation_date , 
			channel_groups.created_by ,
			channel_groups.row_version , 
			channel_groups.channel_id , 
			channel_groups.group_id , 
			channel_groups.channel_group_revoke_users 
		FROM TEMP_CHANNEL_GROUPS_ADDED channel_groups 
		
	
		;

END;
$BODY$;

ALTER FUNCTION public.fn_add_channels_group(integer, integer, integer)
    OWNER TO postgres;
