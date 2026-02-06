import {
    Sun, Moon, CloudSun, CloudMoon, Cloud, CloudRain,
    CloudLightning, CloudSnow, CloudFog
} from "lucide-react";

interface WeatherIconProps {
    code: string;
    className?: string;
    ariaLabel?: string;
}

/**
 * Weather Icon
 * Maps OpenWeatherMap codes to Lucide icons.
 */
export function WeatherIcon({ code, className = "w-6 h-6", ariaLabel }: WeatherIconProps) {
    const iconMap: Record<string, React.ElementType> = {
        "01d": Sun,
        "01n": Moon,
        "02d": CloudSun,
        "02n": CloudMoon,
        "03d": Cloud,
        "03n": Cloud,
        "04d": Cloud,
        "04n": Cloud,
        "09d": CloudRain,
        "09n": CloudRain,
        "10d": CloudRain,
        "10n": CloudRain,
        "11d": CloudLightning,
        "11n": CloudLightning,
        "13d": CloudSnow,
        "13n": CloudSnow,
        "50d": CloudFog,
        "50n": CloudFog,
    };

    const IconComponent = iconMap[code] || CloudSun; // Default to CloudSun

    return (
        <IconComponent
            className={className}
            aria-hidden={!ariaLabel}
            aria-label={ariaLabel}
            role={ariaLabel ? "img" : undefined}
        />
    );
}
