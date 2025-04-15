import pandas as pd
import os
import math

def AnalyzeDraft():
#    print('asdf')
    YEARS = range(2015,2024)
    wd = os.getcwd()
    drafts = {}
    ranks = {}
    counts = {}
    posCounts = {}
    for year in YEARS:
        fp = os.path.join(wd,'drafts',str(year)+'.csv')
        drafts[year] = pd.read_csv(fp)
        fp = os.path.join(wd,'drafts','rankings',str(year)+'rank.csv')
        ranks[year] = pd.read_csv(fp)
        teams = {}
        if year == min(YEARS):
            allTeams = []
            allPoses = []
            for team in ranks[year]['Team']:
                if team not in allTeams and type(team)==str:
                    if team.lower() == 'sd':team='lac'
                    if team.lower() == 'la' or team.lower() == 'stl':team='lar'
                    if team.lower() == 'oak':team='lv'
                    allTeams.append(team.lower())
            for pos in ranks[year]['Position']:
                if pos not in allPoses and type(pos) == str and pos != 'RB/WR':
                    allPoses.append(pos)
            allPoses.append('D/ST')

        for key in drafts[year].keys():
            if 'Unnamed' not in key:
                if key not in counts.keys():
                    counts[key] = {team:0 for team in allTeams}
                    posCounts[key] = {pos:0 for pos in allPoses}
                if 'overall' not in counts.keys():
                    counts['overall'] = {team:0 for team in allTeams}
                    posCounts['overall'] = {pos:0 for pos in allPoses}
                teams[key] = drafts[year][key]
                playerNames = ranks[year]['Name'].tolist()
                playerTeams = ranks[year]['Team'].tolist()
                if year <= 2017:
                    playerPoses = ranks[year]['Position'].tolist()
                else:
                    playerPoses = ranks[year]['Pos'].tolist()
                for name in teams[key]:
                    if name == 'NAME':
                        continue
                    if name not in playerNames:continue
                    team = playerTeams[playerNames.index(name)]
                    pos = playerPoses[playerNames.index(name)]
                    if 'D/ST' in name:
                        pos = 'D/ST'
                    if pos == 'RB/WR':pos='RB'
                    posCounts[key][pos] += 1
                    posCounts['overall'][pos] += 1
                    if type(team) == str:
                        if team.lower() == 'jax':team='jac'
                        if team.lower() == 'was':team='wsh'
                        if team.lower() == 'sd':team='lac'
                        if team.lower() == 'la' or team.lower() == 'stl':team='lar'
                        if team.lower() == 'oak':team='lv'
                        try:
                            counts[key][team.lower()] += 1
                            counts['overall'][team.lower()] += 1
                        except:
                            print(team,year)
                            quit()

        # print(counts.keys())
        # quit()
    # for person in counts.keys():
    #     print(person,counts[person]['pit'])
    maxes = {}
    mins = {}
    posMaxes = {}
    posMins = {}
    for key in counts.keys():
        if key not in maxes.keys():
            maxes[key] = [0,["NA"]]
            mins[key] = [999,["NA"]]
            posMaxes[key] = [0,["NA"]]
            posMins[key] = [999,["NA"]]
        for team in counts[key].keys():
            if counts[key][team] > maxes[key][0]:
                maxes[key] = [counts[key][team],[team.upper()]]
            elif counts[key][team] == maxes[key][0]:
                maxes[key][1].append(team.upper())
            if counts[key][team] < mins[key][0] and team.lower() != 'fa':
                mins[key] = [counts[key][team],[team.upper()]]
            elif counts[key][team] == mins[key][0] and team.lower() != 'fa':
                mins[key][1].append(team.upper())
        for pos in posCounts[key].keys():
            # print(pos)
            if posCounts[key][pos] > posMaxes[key][0]:
                posMaxes[key] = [posCounts[key][pos],[pos.upper()]]
            elif posCounts[key][pos] == posMaxes[key][0]:
                posMaxes[key][1].append(pos.upper())
            if posCounts[key][pos] < posMins[key][0] and pos.lower() != 'fa':
                posMins[key] = [posCounts[key][pos],[pos.upper()]]
            elif posCounts[key][pos] == posMins[key][0] and pos.lower() != 'fa':
                posMins[key][1].append(pos.upper())

    # for item in maxes.keys():
    #     print(item,maxes[item],mins[item])
        
    # print(dict(sorted(counts['overall'].items(), key=lambda item: item[1])))

    for item in posMaxes.keys():
        print(item,posMaxes[item],posMins[item])
    print(dict(sorted(posCounts['overall'].items(), key=lambda item: item[1])))

        #    pd.read_csv


if __name__ == '__main__':
    AnalyzeDraft()