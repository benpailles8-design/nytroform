import requests, os, time

gifs = {
    'bench_press': 'developpe-couche-barre-exercice-musculation',
    'incline_bench': 'developpe-incline-barre-exercice-musculation',
    'decline_bench': 'developpe-decline-barre-exercice-musculation',
    'db_bench': 'developpe-couche-halteres-exercice-musculation',
    'db_incline': 'developpe-incline-halteres-exercice-musculation',
    'db_flyes': 'ecarte-halteres-exercice-musculation',
    'pushup': 'pompes-exercice-musculation',
    'dips_chest': 'dips-exercice-musculation',
    'deadlift': 'souleve-de-terre-exercice-musculation',
    'pullup': 'tractions-exercice-musculation',
    'lat_pulldown': 'tirage-vertical-exercice-musculation',
    'seated_row': 'tirage-horizontal-exercice-musculation',
    'bent_row': 'rowing-barre-exercice-musculation',
    'db_row': 'rowing-haltere-exercice-musculation',
    'hyperextension': 'extensions-lombaires-exercice-musculation',
    'ohp': 'developpe-militaire-barre-exercice-musculation',
    'db_press': 'developpe-militaire-halteres-exercice-musculation',
    'lateral_raise': 'elevations-laterales-exercice-musculation',
    'front_raise': 'elevations-frontales-exercice-musculation',
    'shrugs': 'haussements-epaules-exercice-musculation',
    'arnold_press': 'arnold-press-exercice-musculation',
    'barbell_curl': 'curl-barre-exercice-musculation',
    'db_curl': 'curl-halteres-exercice-musculation',
    'hammer_curl': 'curl-marteau-exercice-musculation',
    'preacher_curl': 'curl-pupitre-exercice-musculation',
    'skullcrusher': 'barre-au-front-exercice-musculation',
    'tricep_pushdown': 'pushdown-triceps-exercice-musculation',
    'overhead_tricep': 'extension-triceps-haltere-exercice-musculation',
    'dips_tricep': 'dips-triceps-exercice-musculation',
    'squat': 'squat-barre-exercice-musculation',
    'leg_press': 'presse-cuisses-exercice-musculation',
    'leg_extension': 'extension-jambes-exercice-musculation',
    'leg_curl': 'curl-jambes-exercice-musculation',
    'rdl': 'souleve-de-terre-roumain-exercice-musculation',
    'lunges': 'fentes-exercice-musculation',
    'hip_thrust': 'hip-thrust-exercice-musculation',
    'calf_raise': 'extensions-mollets-exercice-musculation',
    'goblet_squat': 'goblet-squat-exercice-musculation',
    'bulgarian_squat': 'squat-bulgare-exercice-musculation',
    'crunch': 'crunch-exercice-musculation',
    'plank': 'gainage-exercice-musculation',
    'leg_raise': 'releves-jambes-exercice-musculation',
    'russian_twist': 'russian-twist-exercice-musculation',
    'mountain_climber': 'mountain-climber-exercice-musculation',
    'burpee': 'burpee-exercice-musculation',
    'kettlebell_swing': 'kettlebell-swing-exercice-musculation',
    'jump_rope': 'corde-a-sauter-exercice-musculation',
    'face_pull': 'face-pull-exercice-musculation',
    'upright_row': 'tirage-menton-exercice-musculation',
    'rear_delt': 'oiseau-epaules-exercice-musculation',
    'cable_crossover': 'cable-croise-exercice-musculation',
    'ab_wheel': 'roue-abdominale-exercice-musculation',
    'cable_crunch': 'crunch-poulie-exercice-musculation',
    'side_plank': 'gainage-lateral-exercice-musculation',
    'box_jump': 'saut-box-exercice-musculation',
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://www.docteur-fitness.com/',
    'Accept': 'image/gif,image/webp,image/*,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9',
}

os.makedirs('public/gifs', exist_ok=True)
done, errors = 0, []

for name, slug in gifs.items():
    out = 'public/gifs/' + name + '.gif'
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        done += 1
        print('DEJA LA: ' + name)
        continue
    url = 'https://www.docteur-fitness.com/wp-content/uploads/2000/05/' + slug + '.gif'
    try:
        r = requests.get(url, headers=headers, timeout=20)
        if r.status_code == 200 and len(r.content) > 5000:
            open(out, 'wb').write(r.content)
            done += 1
            print('OK: ' + name + ' (' + str(len(r.content)//1024) + 'KB)')
        else:
            errors.append(name)
            print('ERREUR ' + str(r.status_code) + ': ' + name)
    except Exception as e:
        errors.append(name)
        print('ERREUR: ' + name + ' - ' + str(e))
    time.sleep(0.5)

print('')
print('Termine: ' + str(done) + '/' + str(len(gifs)) + ' OK')
if errors:
    print('Manquants: ' + ', '.join(errors))
