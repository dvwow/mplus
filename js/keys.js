async function callAPI(api, params) {
    const base_url = 'https://raider.io';
    const response = await fetch(base_url + api + '?' + params);
    return response.json();
}

async function callLocal(filename) {
    const response = await fetch(filename);
    return response.json();
}

async function getDungeons(expansion = 9) {
    const api = '/api/v1/mythic-plus/static-data';
    const params = 'expansion_id=' + expansion;

    const data = await callAPI(api, params);
    let dungeons = [];

    data.seasons[0].dungeons.forEach(d => {
        dungeons.push(d.short_name);
    });

    return dungeons;
}

async function getVaultKeys(region, realm, character) {
    let vault_data = {};
    const api = '/api/v1/characters/profile';
    const character_params =
        'region=' + region
        + '&realm='+ realm
        + '&name=' + character
        + '&fields=mythic_plus_scores_by_season:current%2Cmythic_plus_weekly_highest_level_runs';

    const data = await callAPI(api, character_params)
    let character_row = '<td>' + data.name + '</td><td>' + data.mythic_plus_scores_by_season[0].all + '</td>';
    return {
        name: data.name,
        score: data.mythic_plus_scores_by_season[0].scores.all,
        keys: data.mythic_plus_weekly_highest_level_runs.slice(0,8)
    };
}

async function getCharacter(region, realm, character) {
    const api = '/api/v1/characters/profile';
    const top_keys_params =
        'region=' + region
        + '&realm='+ realm
        + '&name=' + character
        + '&fields=mythic_plus_scores_by_season:current%2Cmythic_plus_best_runs%2Cmythic_plus_alternate_runs';

    //callAPI(api, top_keys_params, function() {
    const dungeons = await getDungeons(9);
    const player_data = await callLocal('testdata.json');

    let key_list = {};
    dungeons.forEach(d => {
        key_list[d] = {
            'Fortified': {},
            'Tyrannical': {}
        }
    });
    
    player_data.mythic_plus_best_runs.forEach(m => {
        key_list[m.short_name][m.affixes[0].name] = {
            'key_level': m.mythic_level,
            'score': m.score
        }
    });

    player_data.mythic_plus_alternate_runs.forEach(m => {
        key_list[m.short_name][m.affixes[0].name] = {
            'key_level': m.mythic_level,
            'score': m.score
        }
    });

    Object.entries(key_list).forEach(([key, scores])  => {
        key_list[key]['score'] = generateScore(scores.Fortified.score, scores.Tyrannical.score);
    });

    return key_list;
}

async function getKeyList(region, realm, character) {
    const keys = await getCharacter(region, realm, character);
    console.log(keys);
}

function getScoreDiff(current_score, level, affix) {
    const score_data = {
        '2': 60,
        '3': 67.5,
        '4': 82.5,
        '5': 90,
        '6': 97.5,
        '7': 112.5,
        '8': 120,
        '9': 127.5,
        '10': 150,
        '11': 157.5,
        '12': 165,
        '13': 172.5,
        '14': 180,
        '15': 187.5,
        '16': 195,
        '17': 202.5,
        '18': 210,
        '19': 217.5,
        '20': 225,
        '21': 232.5,
        '22': 240,
        '23': 247.5,
        '24': 255,
        '25': 262.5,
        '26': 270,
        '27': 277.5,
        '28': 285,
        '29': 292.5,
        '30': 300
    };


}

function generateScore(fortified, tyrannical) {
    const score_array = [fortified, tyrannical].sort().reverse();
    const total_score = parseFloat(score_array[0] * 1.5) + parseFloat(score_array[1] * .5);
    return total_score;
}
