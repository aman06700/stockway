"""
Minimal health-check endpoint for uptime monitoring.
No database, authentication, or external service dependencies.
"""

from django.http import JsonResponse


def health_check(request):
    """
    Simple health-check endpoint that returns status ok.
    Used for uptime monitoring and warming free-tier deployments.
    """
    return JsonResponse({"status": "ok"})
