export const remoteCases = [
    { handler: 'updateProcess', name: 'rpa-update-process', method: 'POST',
      path: '/rpav2/local-api/update-process-by-api', params: { id: '123', process_file: '/tmp/updated.json.gz', batch_id: '0', name: 'Renamed', variable: '[]', setting: '{}', remark: 'Existing remark' } },
    { handler: 'getTemplateSubscriptionInfo', name: 'rpa-get-template-subscription-info', method: 'GET',
      path: '/rpav2/local-api/get-template-subscription-info-by-api', params: { id: '123' } },
    { handler: 'createProcess', name: 'rpa-create-process', method: 'POST',
      path: '/rpav2/local-api/create-process-by-api',
      params: { batch_id: 0, ref_type: 8, name: 'Flow', process_file: '/tmp/flow.json.gz' } },
    {
        "handler": "createTask",
        "name": "rpa-create-task",
        "method": "POST",
        "path": "/rpav2/local-api/create-task-by-api",
        "params": {
            "name": "Task",
            "fbcc_user_ids": "11,12",
            "process_id": 1,
            "exec_type": 1,
            "exec_sort": 1,
            "exec_priority": 0,
            "schedule_rule": "{}"
        }
    },
    {
        "handler": "getProcessList",
        "name": "rpa-get-process-list",
        "method": "GET",
        "path": "/rpav2/local-api/get-process-list-by-api",
        "params": { "page_size": 10,  "access_link": 0, "origin": "0", "block_expired_paid_template_process": 1 }
    },
    {
        "handler": "getProcessListCount",
        "name": "rpa-get-process-list-count",
        "method": "GET",
        "path": "/rpav2/local-api/get-process-list-count-by-api",
        "params": { "page_size": 10,  "access_link": 0, "origin": "0", "block_expired_paid_template_process": 1 }
    },
    {
        "handler": "getTaskList",
        "name": "rpa-get-task-list",
        "method": "GET",
        "path": "/rpav2/local-api/get-task-list-by-api",
        "params": { "page_size": 10 }
    },
    {
        "handler": "getTaskListCount",
        "name": "rpa-get-task-list-count",
        "method": "GET",
        "path": "/rpav2/local-api/get-task-list-count-by-api",
        "params": { "page_size": 10 }
    },
    {
        "handler": "getTaskDetail",
        "name": "rpa-get-task-detail",
        "method": "GET",
        "path": "/rpav2/local-api/get-task-detail-by-api",
        "params": {
            "ids": "1,2"
        }
    },
    {
        "handler": "deleteTask",
        "name": "rpa-delete-task",
        "method": "POST",
        "path": "/rpav2/local-api/delete-task-by-api",
        "params": {
            "ids": "1,2"
        }
    },
    {
        "handler": "updateTask",
        "name": "rpa-update-task",
        "method": "POST",
        "path": "/rpav2/local-api/update-task-by-api",
        "params": {
            "id": "1",
            "name": "Task",
            "process_id": 1,
            "exec_type": 1,
            "exec_sort": 1,
            "exec_priority": 0,
            "schedule_rule": "{}"
        }
    },
    {
        "handler": "getTaskRuntimeList",
        "name": "rpa-get-task-runtime-list",
        "method": "GET",
        "path": "/rpav2/local-api/get-task-runtime-list-by-api",
        "params": {
            "task_id": "1",
            "page": 1,
            "page_size": 10
        }
    },
    {
        "handler": "getTaskRuntimeListCount",
        "name": "rpa-get-task-runtime-list-count",
        "method": "GET",
        "path": "/rpav2/local-api/get-task-runtime-list-count-by-api",
        "params": {
            "task_id": "1"
        }
    },
    {
        "handler": "addTaskRuntime",
        "name": "rpa-add-task-runtime",
        "method": "POST",
        "path": "/rpav2/local-api/add-task-runtime-by-api",
        "params": {
            "task_id": "1",
            "fbcc_user_ids": "11,12"
        }
    },
    {
        "handler": "deleteTaskRuntime",
        "name": "rpa-delete-task-runtime",
        "method": "POST",
        "path": "/rpav2/local-api/delete-task-runtime-by-api",
        "params": {
            "task_id": "1",
            "ids": "21,22"
        }
    },
    {
        "handler": "updateProcessEditableFields",
        "name": "rpa-update-process-editable-fields",
        "method": "POST",
        "path": "/rpav2/local-api/update-process-editable-fields-by-api",
        "params": {
            "id": "1",
            "variable": "[]",
            "setting": "{}",
            "remark": "Updated",
            "name": "Flow",
            "batch_id": "0"
        }
    },
    {
        "handler": "deleteProcess",
        "name": "rpa-delete-process",
        "method": "POST",
        "path": "/rpav2/local-api/delete-process-by-api",
        "params": {
            "ids": "1,2"
        }
    },
    {
        "handler": "copyProcess",
        "name": "rpa-copy-process",
        "method": "POST",
        "path": "/rpav2/local-api/copy-process-by-api",
        "params": {
            "id": "1",
            "batch_id": "0"
        }
    },
    {
        "handler": "moveProcess",
        "name": "rpa-move-process",
        "method": "POST",
        "path": "/rpav2/local-api/move-process-by-api",
        "params": {
            "ids": "1,2",
            "batch_id": "0"
        }
    },
    {
        "handler": "topProcess",
        "name": "rpa-top-process",
        "method": "POST",
        "path": "/rpav2/local-api/top-process-by-api",
        "params": {
            "id": "1"
        }
    },
    {
        "handler": "getBatchList",
        "name": "rpa-get-batch-list",
        "method": "GET",
        "path": "/rpav2/local-api/get-batch-list-by-api",
        "params": {
            "page": 1,
            "page_size": 10
        }
    },
    {
        "handler": "createBatch",
        "name": "rpa-create-batch",
        "method": "POST",
        "path": "/rpav2/local-api/create-batch-by-api",
        "params": {
            "name": "Group"
        }
    },
    {
        "handler": "updateBatch",
        "name": "rpa-update-batch",
        "method": "POST",
        "path": "/rpav2/local-api/update-batch-by-api",
        "params": {
            "id": "1",
            "name": "Group"
        }
    },
    {
        "handler": "deleteBatch",
        "name": "rpa-delete-batch",
        "method": "POST",
        "path": "/rpav2/local-api/delete-batch-by-api",
        "params": {
            "ids": "1,2"
        }
    },
    {
        "handler": "createShare",
        "name": "rpa-create-share",
        "method": "POST",
        "path": "/rpav2/local-api/create-share-by-api",
        "params": {
            "process_ids": "1,2",
            "quota": 1,
            "expired_time": 1,
            "share_config": ""
        }
    },
    {
        "handler": "receiveShare",
        "name": "rpa-receive-share",
        "method": "POST",
        "path": "/rpav2/local-api/receive-share-by-api",
        "params": {
            "share_code": "example",
            "batch_id": "0"
        }
    }
] as const;
