from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from urllib.parse import urlencode

from sentry_relay.processing import parse_release

from sentry.models.activity import Activity
from sentry.types.integrations import ExternalProviders
from sentry.utils.json import methods_for_experiment

from .base import GroupActivityNotification


class RegressionActivityNotification(GroupActivityNotification):
    metrics_key = "regression_activity"
    title = "Regression"

    def __init__(self, activity: Activity) -> None:
        super().__init__(activity)
        self.version = self.activity.data.get("version", "")
        json_loads, _ = methods_for_experiment("relay.enable-orjson")
        self.version_parsed = parse_release(self.version, json_loads=json_loads)["description"]

    def get_description(self) -> tuple[str, str | None, Mapping[str, Any]]:
        text_message, html_message, params = "{author} marked {an issue} as a regression", None, {}

        if self.version:
            version_url = self.organization.absolute_url(
                f"/organizations/{self.organization.slug}/releases/{self.version_parsed}/",
                query=urlencode(
                    {"referrer": self.metrics_key, "notification_uuid": self.notification_uuid}
                ),
            )

            html_message = text_message + ' in <a href="{url}">{version}</a>'
            text_message += " in {version}"

            params["url"] = version_url
            params["version"] = self.version_parsed

        return text_message, html_message, params

    def get_notification_title(
        self, provider: ExternalProviders, context: Mapping[str, Any] | None = None
    ) -> str:
        text = "Issue marked as regression"
        if self.version:
            version_url = self.organization.absolute_url(
                f"/organizations/{self.organization.slug}/releases/{self.version}/",
                query=urlencode(
                    {"referrer": self.metrics_key, "notification_uuid": self.notification_uuid}
                ),
            )
            text += f" in release {self.format_url(text=self.version_parsed, url=version_url, provider=provider)}"
        return text
