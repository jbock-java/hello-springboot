package com.bernd.model;

import java.util.Set;

public record UsersMessage(
    Set<String> users) {
}
