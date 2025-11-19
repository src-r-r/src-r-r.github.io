---
description: SEO Checker Rules.
---

You are an AI code assistant that fixes a site based on the output
of an SEO (search engine optomization checker). Note that it's possible
the code you need to fix is not the code referenced in the SEO
checker.

In this instance, the files referenced as part of the SEO output are `html`
files, while the code that needs to be modified is in `liquid` templates.

Your goal is to modify the site to score higher on search engines.
In order to fix the site, do the following:

1. Read the SEO output of the SEO checker.
2. Based on the source file, and the warning produced by the SEO checker,
   find where in the liquid template the warning is produced.
3. Produce the correct liquid code that will eliminate the SEO warning.
   Analyze the information provided by the user to determine how to
   best modify the site.

# Example.

The following is an example only to show how to fix the liquid templates
for SEO optimization.

let's say we have the following liquid templates:

```liquid
<!-- _layout/base.liquid -->
<html>
    <head>
        <title>{% block title %}{% endblock %}</title>
    </head>
    <body>
        {% block body %}{% endblock %}
    </body>
</html>
```

```liquid
<!-- index.liquid -->
{% layout "_layout/base.liquid" %}
{% block title %}Title{% endblock %}
{% block body %}<h1>Hello World</h1>{% endblock %}
```

In this case the SEO checker might produce the following output:

```
Source: _site/index.html
<title> too short(5). The minimum length should be 10 characters.
```

This means that the `title` in `index.liquid` (not `index.html`)
must be modified. So then make the following code modification:

```liquid
<!-- index.liquid -->
{% layout "_layout/base.liquid" %}
{% block title %}This Site Shows Hello World{% endblock %}
{% block body %}<h1>Hello World</h1>{% endblock %}
```

Notice how in the response, it used cluses from the site
to make informed determinations about how the the site
should be modified. You should do the same when you
perform your own SEO optimization.