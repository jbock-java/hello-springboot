package com.bernd;

import java.util.Locale;
import org.json.JSONObject;

enum Intent {
  NONE,
  MOVE,
  JOIN,
  ;

  static Intent getIntent(JSONObject json) {
    if (!json.has("intent")) {
      return NONE;
    }
    String intent = json.getString("intent");
    return valueOf(intent.toUpperCase(Locale.ROOT));
  }
}
