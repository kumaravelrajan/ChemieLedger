const errorRequired = "Dieses Feld ist erforderlich.";
const errorEmail = "Bitte geben Sie eine gültige E-Mail ein.";
const errorPasswordLength = "Passwort muss mindestens 5 Zeichen enthalten.";
const errorNumberGreaterZero = "Zahl muss größer 0 sein.";
const errorPlzFormat = "PLZ muss aus 5 Zahlen bestehen.";
const errorPlzRange = "Muss zwischen 0 und 99999 liegen.";

type validation = ((v: any) => true | string)[]

export const fieldRequired: validation = [v => !!v || errorRequired];

export const fieldEmail: validation = [
  v => !!v || errorRequired,
  v => {
    return (
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        v
      ) || errorEmail
    );
  }
];

export const fieldPLZ: validation = [
  v => !!v || errorRequired,
  v => {
    return /[0-9][0-9][0-9][0-9][0-9]/.test(v) || errorPlzFormat;
  }
];

export const fieldPLZArea: validation = [
  v => {
    return !v || /^([0-9]{1,5})$/.test(v) || errorPlzRange;
  }
];

export const fieldPassword: validation = [
  v => !!v || errorRequired,
  v => (v || "").length >= 5 || errorPasswordLength
];

export const numberGreaterZero: validation = [v => v > 0 || errorNumberGreaterZero];

export const requiredNumberGreaterZero: validation = [
  v => !!v || errorRequired,
  v => v > 0 || errorNumberGreaterZero
];

export const imageSizeLimitCover: validation = [
  v => !!v || errorRequired,
  v => !v || v.size < 5000000 || "Bild muss kleiner als 5MB groß sein."
];
export const imageSizeLimit: validation = [
  v => !!v || errorRequired,
  v => !v || v.size < 2000000 || "Bild muss kleiner als 2MB groß sein."
];
