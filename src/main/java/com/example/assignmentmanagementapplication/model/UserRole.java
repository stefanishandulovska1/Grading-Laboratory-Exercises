package com.example.assignmentmanagementapplication.model;

public enum UserRole {
    СТУДЕНТ("Студент"),
    НАСТАВНИК("Наставник"),
    АСИСТЕНТ("Асистент");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
