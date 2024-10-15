package com.bernd.model;

public record UserStatus(
        String room,
        long lastSeen) {

    private static final long USER_TIMEOUT = 45 * 1000;

    public static UserStatus create(String room) {
        return new UserStatus(room, System.currentTimeMillis());
    }

    public UserStatus touch() {
        return new UserStatus(room, System.currentTimeMillis());
    }

    public boolean isActive(long current) {
        return current < lastSeen + USER_TIMEOUT;
    }
}
