import latestChangelog from '../constants/changelog'

export const useChangelogs = () => {
    
    function hasLatestChangelogBeenSeen() {
        const seenChangelog = localStorage.getItem('lastSeenChangelog');
        return seenChangelog === latestChangelog.version;
    }

    function setHasSeenLatestChangelog() {
        localStorage.setItem('lastSeenChangelog', latestChangelog.version);
    }

    return {
        states: {
            latestChangelog
        },
        actions: {
            hasLatestChangelogBeenSeen,
            setHasSeenLatestChangelog
        }
    }
}