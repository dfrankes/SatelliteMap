import { Vector3 } from 'three';

export default function CartesianToVector(latlng, height = 0, radius = 6371) {

    // Add height to radius 
    radius += height;

    // Get lat,lng from array
    const lat = latlng[0];
    const lng = latlng[1];

    // phi and theta
    var phi = (90 - lat) * (Math.PI / 180)
    var theta = (lng + 180) * (Math.PI / 180)

    // Calculate vector3
    return new Vector3(-((radius) * Math.sin(phi) * Math.cos(theta)), ((radius) * Math.cos(phi)), ((radius) * Math.sin(phi) * Math.sin(theta)))
}