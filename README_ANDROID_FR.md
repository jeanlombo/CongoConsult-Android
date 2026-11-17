# AFRICA CONSULTING GROUP SARL – Android Capacitor

Source rebrandée de l'application Android installable.

- Nom de l'application : **AFRICA CONSULTING GROUP SARL**
- Téléphone : **+243 851 328 013**
- Nouvel identifiant Android : `com.africaconsultinggroup.mobile` (s'installe séparément de l'ancienne application AFRICA CONSULTING GROUP SARL).
- Le serveur PHP/MySQL est toujours le même ; **appliquer d'abord** la migration SQL du site.
- Le workflow `.github/workflows/android-debug-apk.yml` emploie le SDK v4 qui a permis le dernier build GitHub réussi.

## Dans GitHub

Solution la plus fiable : importer ces fichiers et dossiers dans le dépôt en conservant la structure (`src/`, `public/`, `assets/`, `.github/workflows/`), par `git` ou import de dossier.

Si ton dépôt existant est encore **aplati à la racine** (app.js, style.css, icon.svg ...), utilise plutôt l'archive ZIP « Patch_GitHub_Existant » jointe séparément. Elle est conçue pour remplacer exactement les fichiers de la racine. Le workflow déjà présent les rassemble automatiquement.

Dans GitHub : Actions > workflow « AFRICA CONSULTING GROUP SARL - Generer APK Android » > Run workflow. Après le succès, télécharger l'Artifact `AFRICA-CONSULTING-GROUPE-SARL-Android-debug-APK`, décompresser, puis installer `app-debug.apk` sur Android.

**Attention** : l'APK binaire n'est pas inclus ici ; GitHub Actions produit ce fichier. Ce changement d'`appId` donne une nouvelle application distincte (qui ne remplace pas l'ancienne). Tu peux désinstaller l'ancienne version après validation.

L'URL HTTPS du serveur se renseigne toujours depuis l'application : Plus > Configurer la connexion. Les adresses trycloudflare.com restent temporaires.
