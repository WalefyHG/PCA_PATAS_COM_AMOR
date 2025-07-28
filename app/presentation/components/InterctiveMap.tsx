"use client"

import { useState, useEffect, useRef } from "react"


declare global {
    interface Window {
        google: any
    }
}
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useThemeContext } from "../contexts/ThemeContext"

const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 380
const isWebPlatform = Platform.OS === "web"

interface InteractiveMapProps {
    onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void
    initialLocation?: { latitude: number; longitude: number }
    height?: number
}

export default function InteractiveMap({ onLocationSelect, initialLocation, height = 300 }: InteractiveMapProps) {
    const { isDarkTheme, colors } = useThemeContext()
    const [currentLocation, setCurrentLocation] = useState(initialLocation || null)
    const [isLoading, setIsLoading] = useState(false)
    const [mapLoaded, setMapLoaded] = useState(false)
    const mapRef = useRef<any>(null)

    // Web map implementation using Google Maps
    const initializeWebMap = () => {
        if (Platform.OS !== "web" || !window.google) return

        const mapElement = document.getElementById("pet-location-map")
        if (!mapElement) return

        const defaultCenter = currentLocation || { lat: -23.5505, lng: -46.6333 } // São Paulo default

        const map = new window.google.maps.Map(mapElement, {
            center: defaultCenter,
            zoom: 13,
            styles: isDarkTheme
                ? [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{ color: "#263c3f" }],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#6b9a76" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{ color: "#746855" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#1f2835" }],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#f3d19c" }],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{ color: "#2f3948" }],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#515c6d" }],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{ color: "#17263c" }],
                    },
                ]
                : [],
        })

        let marker: any = null

        // Add marker if there's an initial location
        if (currentLocation) {
            marker = new window.google.maps.Marker({
                position: currentLocation,
                map: map,
                title: "Localização do Pet",
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: colors.primary,
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                },
            })
        }

        // Handle map clicks
        map.addListener("click", async (event: any) => {
            const lat = event.latLng.lat()
            const lng = event.latLng.lng()

            // Remove existing marker
            if (marker) {
                marker.setMap(null)
            }

            // Add new marker
            marker = new window.google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: "Localização do Pet",
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: colors.primary,
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                },
            })

            // Get address from coordinates
            const geocoder = new window.google.maps.Geocoder()
            try {
                const result = await new Promise((resolve, reject) => {
                    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                        if (status === "OK" && results[0]) {
                            resolve(results[0].formatted_address)
                        } else {
                            reject("Geocoder failed")
                        }
                    })
                })

                setCurrentLocation({ latitude: lat, longitude: lng })
                onLocationSelect({
                    latitude: lat,
                    longitude: lng,
                    address: result as string,
                })
            } catch (error) {
                console.error("Geocoding error:", error)
                onLocationSelect({
                    latitude: lat,
                    longitude: lng,
                    address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                })
            }
        })

        mapRef.current = map
        setMapLoaded(true)
    }

    // Get current location
    const getCurrentLocation = async () => {
        setIsLoading(true)
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permissão necessária", "Precisamos de permissão para acessar sua localização.")
                return
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            })

            const { latitude, longitude } = location.coords
            const newLocation = { latitude, longitude }

            setCurrentLocation(newLocation)

            // Update map center
            if (Platform.OS === "web" && mapRef.current) {
                mapRef.current.setCenter({ lat: latitude, lng: longitude })
                mapRef.current.setZoom(15)
            }

            // Get address
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                })

                let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                if (reverseGeocode.length > 0) {
                    const addr = reverseGeocode[0]
                    const parts = []
                    if (addr.street) parts.push(addr.street)
                    if (addr.streetNumber) parts.push(addr.streetNumber)
                    if (addr.district) parts.push(addr.district)
                    if (addr.city) parts.push(addr.city)
                    if (addr.region) parts.push(addr.region)
                    address = parts.join(", ") || address
                }

                onLocationSelect({ latitude, longitude, address })
            } catch (error) {
                console.error("Reverse geocoding error:", error)
                onLocationSelect({
                    latitude,
                    longitude,
                    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                })
            }
        } catch (error) {
            console.error("Location error:", error)
            Alert.alert("Erro", "Não foi possível obter sua localização.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (Platform.OS === "web") {
            // Load Google Maps script
            if (!window.google) {
                const script = document.createElement("script")
                script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`
                script.async = true
                script.defer = true
                script.onload = initializeWebMap
                document.head.appendChild(script)
            } else {
                initializeWebMap()
            }
        }
    }, [isDarkTheme, colors.primary])

    if (Platform.OS === "web") {
        return (
            <View style={[styles.container, { height }]}>
                <View style={styles.mapHeader}>
                    <Text style={[styles.mapTitle, { color: isDarkTheme ? "white" : "#374151" }]}>
                        Selecione a localização do pet
                    </Text>
                    <TouchableOpacity
                        style={[styles.locationButton, { backgroundColor: colors.primary }]}
                        onPress={getCurrentLocation}
                        disabled={isLoading}
                    >
                        <Feather name={isLoading ? "loader" : "map-pin"} size={16} color="white" />
                        <Text style={styles.locationButtonText}>Minha Localização</Text>
                    </TouchableOpacity>
                </View>
                <View
                    id="pet-location-map"
                    style={[
                        styles.webMap,
                        {
                            backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
                            borderColor: isDarkTheme ? "#4B5563" : "#E5E7EB",
                        },
                    ]}
                />
                <Text style={[styles.mapHint, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                    Toque no mapa para selecionar a localização exata do pet
                </Text>
            </View>
        )
    }

    // Mobile fallback - simplified map or location picker
    return (
        <View style={[styles.container, { height }]}>
            <View style={styles.mapHeader}>
                <Text style={[styles.mapTitle, { color: isDarkTheme ? "white" : "#374151" }]}>Localização do Pet</Text>
                <TouchableOpacity
                    style={[styles.locationButton, { backgroundColor: colors.primary }]}
                    onPress={getCurrentLocation}
                    disabled={isLoading}
                >
                    <Feather name={isLoading ? "loader" : "map-pin"} size={16} color="white" />
                    <Text style={styles.locationButtonText}>Obter Localização</Text>
                </TouchableOpacity>
            </View>

            <View
                style={[
                    styles.mobileMapPlaceholder,
                    {
                        backgroundColor: isDarkTheme ? "#374151" : "#F3F4F6",
                        borderColor: isDarkTheme ? "#4B5563" : "#E5E7EB",
                    },
                ]}
            >
                <Feather name="map" size={48} color={colors.primary} />
                <Text style={[styles.placeholderText, { color: isDarkTheme ? "#9CA3AF" : "#6B7280" }]}>
                    {currentLocation ? "Localização selecionada" : "Toque em 'Obter Localização' para definir"}
                </Text>
                {currentLocation && (
                    <Text style={[styles.coordinatesText, { color: isDarkTheme ? "#D1D5DB" : "#374151" }]}>
                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </Text>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    mapHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    mapTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    locationButtonText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },
    webMap: {
        flex: 1,
        minHeight: 200,
        borderWidth: 1,
    },
    mobileMapPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        borderWidth: 1,
    },
    placeholderText: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 12,
        marginBottom: 8,
    },
    coordinatesText: {
        fontSize: 12,
        fontFamily: "monospace",
    },
    mapHint: {
        fontSize: 12,
        textAlign: "center",
        padding: 12,
        fontStyle: "italic",
    },
})
