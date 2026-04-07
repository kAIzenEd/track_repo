def validate_action_items(items):
    clean = []

    for i in items:
        if not isinstance(i, dict):
            continue

        task = i.get("task")
        assignee = i.get("assignee", "Unassigned")

        if not task:
            continue

        clean.append({
            "task": str(task),
            "assignee": str(assignee)
        })

    return clean


def validate_improvements(items):
    clean = []

    for i in items:
        if not isinstance(i, dict):
            continue

        text = i.get("text")

        if not text:
            continue

        clean.append({
            "type": i.get("type", "improvement"),
            "text": str(text)
        })

    return clean
