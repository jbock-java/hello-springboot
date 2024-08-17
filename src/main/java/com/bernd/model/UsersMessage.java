package com.bernd.model;

import java.util.Collection;

public record UsersMessage(
    Collection<String> users) {
}
