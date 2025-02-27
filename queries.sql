/*query for number related to domain*/
SELECT  
    d.domain_name,
    dest.destination_number AS 
    did_number 
    FROM v_destinations dest 
    JOIN v_domains d ON dest.domain_uuid = d.domain_uuid 
    WHERE dest.destination_number = '0733861994';

/*query for checking to where did nunber transfer*/
SELECT 
    d.domain_name,
    dest.destination_number AS did_number,
    dest.destination_app AS action_type,
    dest.destination_data AS action_target
FROM v_destinations dest
JOIN v_domains d ON dest.domain_uuid = d.domain_uuid
WHERE dest.destination_number = '0733861994';


/* query for ring groups details */
SELECT 
    d.domain_name AS domain,
    rg.ring_group_extension AS RG,
    GROUP_CONCAT(rgd.destination_number ORDER BY rgd.destination_number ASC SEPARATOR ', ') AS Destinations,
    rg.ring_group_timeout_data AS `Timeout Destination`, 
    rg.ring_group_forward_enabled AS `Forwarding Enabled`,
    rg.ring_group_forward_destination AS `Forwarding Target`
FROM v_ring_groups rg
JOIN v_domains d ON rg.domain_uuid = d.domain_uuid
LEFT JOIN v_ring_group_destinations rgd ON rg.ring_group_uuid = rgd.ring_group_uuid
WHERE rg.ring_group_extension = '492' AND d.domain_name = 'game-dev.ip-com.co.il'  -- Filter by domain!
GROUP BY d.domain_name, rg.ring_group_extension, rg.ring_group_timeout_data, rg.ring_group_forward_enabled, rg.ring_group_forward_destination;


/*query to check TC conditions*/
SELECT 
    d.domain_name AS domain,
    dp.dialplan_number AS TC,
    GROUP_CONCAT(DISTINCT fwd.dialplan_detail_data ORDER BY fwd.dialplan_detail_data SEPARATOR ', ') AS `Destinations`
FROM v_dialplans dp
JOIN v_domains d ON dp.domain_uuid = d.domain_uuid
LEFT JOIN v_dialplan_details fwd
    ON dp.dialplan_uuid = fwd.dialplan_uuid
    AND fwd.dialplan_detail_tag = 'action'
    AND fwd.dialplan_detail_type = 'transfer'
WHERE dp.dialplan_number = '892'
AND d.domain_name = 'game-dev.ip-com.co.il'
GROUP BY d.domain_name, dp.dialplan_number;


/*query to check IVR option*/
SELECT 
    d.domain_name AS domain,
    ivr.ivr_menu_extension AS IVR_Extension,
    ivr.ivr_menu_name AS IVR_Name,
    opt.ivr_menu_option_digits AS DTMF_Key,
    opt.ivr_menu_option_param AS Destination
FROM v_ivr_menu_options opt
JOIN v_ivr_menus ivr ON opt.ivr_menu_uuid = ivr.ivr_menu_uuid
JOIN v_domains d ON ivr.domain_uuid = d.domain_uuid
WHERE ivr.ivr_menu_extension = '604'
AND d.domain_name = 'game-dev.ip-com.co.il'
ORDER BY opt.ivr_menu_option_digits;



/*query to check EXT option*/
SELECT 
    d.domain_name AS domain,
    e.extension AS Extension,
    e.enabled AS Enabled,
    e.do_not_disturb AS DND_Enabled,
    e.forward_all_enabled AS Forwarding_Enabled,
    e.forward_all_destination AS Forwarding_Number,
    e.forward_busy_enabled AS Forwarding_Busy_Enabled,
    e.forward_busy_destination AS Forwarding_Busy_Number,
    e.forward_no_answer_enabled AS Forwarding_No_Answer_Enabled,
    e.forward_no_answer_destination AS Forwarding_No_Answer_Number,
    e.forward_user_not_registered_enabled AS Forwarding_Unregistered_Enabled,
    e.forward_user_not_registered_destination AS Forwarding_Unregistered_Number
FROM v_extensions e
JOIN v_domains d ON e.domain_uuid = d.domain_uuid
WHERE e.extension = '200'
AND d.domain_name = 'game-dev.ip-com.co.il';

