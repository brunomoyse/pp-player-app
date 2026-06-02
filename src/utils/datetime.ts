
export const formatDate = (dateString: string, lang: string) => {
    return new Date(dateString).toLocaleDateString(getLocale(lang), {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    })
}

export const formatTime = (dateString: string, lang: string) => {
    return new Date(dateString).toLocaleTimeString(getLocale(lang), {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const formatDuration = (seconds: number | null | undefined): string => {
    if (seconds === undefined || seconds === null || seconds < 0) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatDateTime = (dateString: string, lang: string) => {
    return new Date(dateString).toLocaleDateString(getLocale(lang), {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getLocale = (lang: string) => {
    switch (lang) {
        case 'fr':
            return 'fr-BE'
        case 'nl':
            return 'nl-BE'
            break
        default:
            return 'en-GB'
    }
}