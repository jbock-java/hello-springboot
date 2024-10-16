package com.bernd.model;

public record UserStatus(
        String room,
        long lastSeen,
        OpenGame openGame) {

    // max interval between heartbeats
    private static final long USER_TIMEOUT = 45 * 1000;

    public static UserStatus create(String room) {
        return new UserStatus(
                room,
                System.currentTimeMillis(),
                null);
    }

    public UserStatus touch() {
        return toBuilder().lastSeen(System.currentTimeMillis()).build();
    }

    public boolean isActive(long current) {
        return current < lastSeen + USER_TIMEOUT;
    }

    public Builder toBuilder() {
        return new Builder(room, lastSeen, openGame);
    }

    public static final class Builder {
        private String room;
        private long lastSeen;
        private OpenGame openGame;

        private Builder(
                String room,
                long lastSeen,
                OpenGame openGame) {
            this.room = room;
            this.lastSeen = lastSeen;
            this.openGame = openGame;
        }

        public Builder room(String room) {
            this.room = room;
            return this;
        }

        public Builder lastSeen(long lastSeen) {
            this.lastSeen = lastSeen;
            return this;
        }

        public Builder openGame(OpenGame openGame) {
            this.openGame = openGame;
            return this;
        }

        public UserStatus build() {
            return new UserStatus(room, lastSeen, openGame);
        }
    }
}
