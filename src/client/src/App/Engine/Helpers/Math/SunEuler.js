export default function SunEuler {
    const now = date || new Date();

    // The boilerplate: fiddling with dates
    const soy = (new Date(now.getFullYear(), 0, 0)).getTime();
    const eoy = (new Date(now.getFullYear() + 1, 0, 0)).getTime();
    const nows = now.getTime();
    const poy = (nows - soy) / (eoy - soy);

    const secs = now.getUTCMilliseconds() / 1e3 +
        now.getUTCSeconds() +
        60 * (now.getUTCMinutes() + 60 * now.getUTCHours());
    const pod = secs / 86400; // leap secs? nah.

    // The actual magic
    const lat = (-pod + 0.5) * Math.PI * 2;
    const lon = Math.sin((poy - .22) * Math.PI * 2) * .41;

    return [lat, lon];
}