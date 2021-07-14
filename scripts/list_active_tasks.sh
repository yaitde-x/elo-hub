${1}/vsts login --token ${3}
${1}/vsts work item query --output json --instance <#scrubbed#> --project <#scrubbed#> --id ${4} > ${2}/active_tasks.json
