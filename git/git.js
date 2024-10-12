/*
1. git init
Egy új Git repozitórium inicializálása a projektedben.
Példa: git init

2. git status
Megmutatja a munkakönyvtárban történt változások állapotát (pl. módosított, színpadra állított, nem követett fájlok).
Példa: git status

3. git add
Színpadra helyezi (stage) a változtatásokat (új vagy módosított fájlok) a következő commit-hoz.
Példa:
Egy adott fájl színpadra helyezése: git add fájlneve
Minden változtatás színpadra helyezése: git add .

4. git commit
A színpadra helyezett változtatások commitálása a repozitóriumba. Egy commit üzenetet használj a változtatások leírására.
Példa: git commit -m "Commit üzenet"

5. git push
A commitált változtatások feltöltése egy távoli repozitóriumba (pl. GitHub).
Példa: git push origin ág_neve

6. git pull
Letölti és egyesíti a változtatásokat egy távoli repozitóriumból a helyi repozitóriumodba.
Példa: git pull origin ág_neve

7. git clone
Egy meglévő repozitórium másolása egy távoli forrásból a helyi gépedre.
Példa: git clone repozitórium_url

8. git branch
Felsorolja az összes ágat a projektben, vagy létrehoz egy új ágat.
Példa:
Ágak listázása: git branch
Új ág létrehozása: git branch ág_neve

9. git checkout
Átvált egy másik ágra, vagy visszaállít fájlokat.
Példa:
Ágra váltás: git checkout ág_neve
Új ág létrehozása és váltás rá: git checkout -b ág_neve

10. git merge
Egyesíti a változtatásokat egy ágról egy másikra.
Példa: git merge ág_neve

11. git log
Megjeleníti a repozitórium commit történetét.
Példa: git log

12. git revert
Egy commit visszavonása egy új commit létrehozásával, ami visszafordítja a változtatásokat.
Példa: git revert commit_azonosító
*/