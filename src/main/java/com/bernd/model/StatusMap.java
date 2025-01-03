package com.bernd.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public final class StatusMap {

    private final Map<String, UserStatus> map = new LinkedHashMap<>();

    public UserStatus setRoom(String user, String room) {
        return map.compute(user, (key, current) -> {
            if (current == null) {
                return UserStatus.create(room);
            } else {
                return current.toBuilder().room(room).touch().build();
            }
        });
    }

    public String getRoom(String user) {
        UserStatus status = map.get(user);
        if (status == null) {
            return null;
        }
        return setRoom(user, status.room()).room();
    }

    public String remove(String user) {
        UserStatus status = map.remove(user);
        if (status == null) {
            return null;
        }
        return status.room();
    }

    public List<String> usersInRoom(String room) {
        List<String> result = new ArrayList<>();
        for (Map.Entry<String, UserStatus> e : map.entrySet()) {
            if (e.getValue().room().equals(room)) {
                result.add(e.getKey());
            }
        }
        return result;
    }

    /**
     * @return a map where key=roomId and value=users
     */
    public Map<String, List<String>> removeInactiveUsers() {
        long current = System.currentTimeMillis();
        Map<String, List<String>> tmp = new HashMap<>();
        List<String> usersToRemove = new ArrayList<>();
        for (Map.Entry<String, UserStatus> e : map.entrySet()) {
            UserStatus status = e.getValue();
            String room = status.room();
            String user = e.getKey();
            if (status.isActive(current)) {
                tmp.computeIfAbsent(room, key -> new ArrayList<>()).add(user);
            } else {
                usersToRemove.add(user);
            }
        }
        for (String user : usersToRemove) {
            UserStatus status = map.get(user);
            if (status == null) {
                continue;
            }
            map.remove(user);
        }
        return tmp;
    }

    public Set<String> activeGames() {
        Set<String> result = new LinkedHashSet<>();
        for (UserStatus status : map.values()) {
            if (!"lobby".equals(status.room())) {
                result.add(status.room());
            }
        }
        return result;
    }

    public UserStatus openGame(OpenGame openGame) {
        UserStatus status = map.get(openGame.user());
        if (status == null) {
            return null;
        }
        UserStatus result = status.openGame(openGame);
        map.put(openGame.user(), result);
        return result;
    }

    public List<OpenGame> openGames() {
        List<OpenGame> result = new ArrayList<>();
        for (UserStatus status : map.values()) {
            if (!"lobby".equals(status.room())) {
                continue;
            }
            if (status.openGame() == null) {
                continue;
            }
            result.add(status.openGame());
        }
        return result;
    }

    public OpenGame removeOpenGame(String name) {
        UserStatus status = map.get(name);
        if (status == null) {
            return null;
        }
        OpenGame result = status.openGame();
        map.put(name, status.removeOpenGame());
        return result;
    }

    public UserStatus addRequest(String name, AcceptRequest request, String opponent) {
        UserStatus status = map.get(name);
        if (status == null) {
            return null;
        }
        OpenGame openGame = status.openGame();
        if (openGame == null) {
            return status;
        }
        OpenGame updated = openGame.addRequest(request, opponent);
        UserStatus result = status.openGame(updated);
        map.put(name, result);
        return result;
    }

    public List<AcceptRequest> getRequests(String name) {
        UserStatus status = map.get(name);
        if (status == null) {
            return List.of();
        }
        OpenGame openGame = status.openGame();
        if (openGame == null) {
            return List.of();
        }
        return openGame.requests();
    }

    public boolean contains(String user) {
        return map.containsKey(user);
    }
}
