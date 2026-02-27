package com.acadevia.locale.util;

import lombok.experimental.UtilityClass;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@UtilityClass
public class VariableInterpolator {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{([^}]+)\\}");

    /**
     * Replace {variable} placeholders with actual values
     * Example: "Hello {name}, you earned {xp} XP!" with {name=Rahul, xp=50}
     * Result:  "Hello Rahul, you earned 50 XP!"
     */
    public static String interpolate(String template, Map<String, String> variables) {
        if (template == null || variables == null || variables.isEmpty()) {
            return template;
        }

        Matcher matcher = VARIABLE_PATTERN.matcher(template);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String varName = matcher.group(1);
            String replacement = variables.getOrDefault(varName, matcher.group(0));
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    /**
     * Extract all variable names from a template
     */
    public static java.util.List<String> extractVariables(String template) {
        java.util.List<String> vars = new java.util.ArrayList<>();
        if (template == null) return vars;

        Matcher matcher = VARIABLE_PATTERN.matcher(template);
        while (matcher.find()) {
            vars.add(matcher.group(1));
        }
        return vars;
    }
}
