<template>
  <div>
    <Card>
      <tables
        ref="tables"
        editable
        searchable
        :border="false"
        size="small"
        search-place="top"
        v-model="stores.manager.data"
        :totalCount="stores.manager.query.totalCount"
        :columns="stores.manager.columns"
        @on-delete="handleDelete"
        @on-edit="handleEdit"
        @on-reset="handleReset"
        @on-select="handleSelect"
        @on-selection-change="handleSelectionChange"
        @on-refresh="handleRefresh"
        :row-class-name="rowClsRender"
        @on-page-change="handlePageChanged"
        @on-page-size-change="handlePageSizeChanged"
      >
        <div slot="search">
          <section class="dnc-toolbar-wrap">
            <Row :gutter="16">
              <Col span="16">
                <Form inline @submit.native.prevent>
                  <FormItem>
                    <Input
                      type="text"
                      search
                      :clearable="true"
                      v-model="stores.manager.query.kw"
                      placeholder="输入关键字搜索..."
                      @on-search="handleSearchManger()"
                    >
                      <Select
                        slot="prepend"
                        v-model="stores.manager.query.isDeleted"
                        @on-change="handleSearchManger"
                        placeholder="删除状态"
                        style="width:60px;"
                      >
                        <Option
                          v-for="item in stores.manager.sources.isDeletedSources"
                          :value="item.value"
                          :key="item.value"
                        >{{item.text}}</Option>
                      </Select>
                      <Select
                        slot="prepend"
                        v-model="stores.manager.query.status"
                        @on-change="handleSearchManger"
                        placeholder="管理老师状态"
                        style="width:60px;"
                      >
                        <Option
                          v-for="item in stores.manager.sources.statusSources"
                          :value="item.value"
                          :key="item.value"
                        >{{item.text}}</Option>
                      </Select>
                    </Input>
                  </FormItem>
                </Form>
              </Col>
              <Col span="8" class="dnc-toolbar-btns">
                <ButtonGroup class="mr3">
                  <Button
                    class="txt-danger"
                    icon="md-trash"
                    title="删除"
                    @click="handleBatchCommand('delete')"
                  ></Button>
                  <Button
                    class="txt-success"
                    icon="md-redo"
                    title="恢复"
                    @click="handleBatchCommand('recover')"
                  ></Button>
                  <Button
                    class="txt-danger"
                    icon="md-hand"
                    title="禁用"
                    @click="handleBatchCommand('forbidden')"
                  ></Button>
                  <Button
                    class="txt-success"
                    icon="md-checkmark"
                    title="启用"
                    @click="handleBatchCommand('normal')"
                  ></Button>
                  <Button icon="md-refresh" title="刷新" @click="handleRefresh"></Button>
                </ButtonGroup>
                <Button
                  icon="md-create"
                  type="primary"
                  @click="handleShowCreateWindow"
                  title="新增管理老师档案"
                >新增管理老师档案</Button>
              </Col>
            </Row>
          </section>
        </div>
      </tables>
    </Card>
    <Drawer
      :title="formTitle"
      v-model="formModel.opened"
      width="400"
      :mask-closable="false"
      :mask="false"
      :styles="styles"
    >
      <Form :model="formModel.fields" ref="formManager" :rules="formModel.rules">
        <FormItem label="管理老师编码" prop="code" label-position="left">
          <Input v-model="formModel.fields.code" placeholder="请输入管理老师编码" />
        </FormItem>
        <FormItem label="管理老师名称" prop="name" label-position="left">
          <Input v-model="formModel.fields.name" placeholder="请输入管理老师名称" />
        </FormItem>
        <FormItem label="联系电话" prop="telNo" label-position="top">
          <Input v-model="formModel.fields.telNo" placeholder="请输入联系电话" />
        </FormItem>
        <FormItem
          label="App登录口令"
          prop="appPwd"
          label-position="top"
          v-show="formModel.mode =='create'"
        >
          <Input v-model="formModel.fields.appPwd" placeholder="请输入App登录口令" />
        </FormItem>
        <FormItem label="归属医院" prop="hospitalId" label-position="top">
          <Select v-model="formModel.fields.hospitalId" placeholder="请选择归属医院">
            <Option
              v-for="item in stores.manager.sources.hospitalSources"
              :value="item.value"
              :key="item.value"
            >{{item.text}}</Option>
          </Select>
        </FormItem>
        <FormItem label="备注" label-position="top" prop="description">
          <Input
            type="textarea"
            v-model="formModel.fields.description"
            :rows="4"
            placeholder="管理老师备注信息"
          />
        </FormItem>
      </Form>
      <div class="demo-drawer-footer">
        <Button icon="md-checkmark-circle" type="primary" @click="handleSubmitManager">保 存</Button>
        <Button style="margin-left: 8px" icon="md-close" @click="formModel.opened = false">取 消</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import Tables from "_c/tables";
import {
  getManagerList,
  createManager,
  loadManager,
  editManager,
  deleteManager,
  batchCommand,
  resetManagerAppPwd
} from "@/api/base/manager";
import { getHospitalSelect } from "@/api/base/hospital";
export default {
  name: "base_manager_page",
  components: {
    Tables
  },
  data() {
    return {
      commands: {
        delete: { name: "delete", title: "删除" },
        recover: { name: "recover", title: "恢复" },
        forbidden: { name: "forbidden", title: "禁用" },
        normal: { name: "normal", title: "启用" }
      },
      formModel: {
        opened: false,
        title: "创建管理老师",
        mode: "create",
        selection: [],
        fields: {
          id: 0,
          code: "",
          name: "",
          telNo: "",
          appPwd: "",
          hospitalId: 0,
          status: 1,
          isDeleted: 0,
          description: ""
        },
        rules: {
          code: [
            {
              type: "string",
              required: true,
              message: "请输入管理老师编码",
              min: 2
            }
          ],
          name: [
            {
              type: "string",
              required: true,
              message: "请输入管理老师名称",
              min: 2
            }
          ],
          telNo: [
            {
              type: "string",
              required: true,
              message: "请输入管理老师联系电话",
              min: 1
            }
          ],
          hospitalId: [
            {
              type: "integer",
              required: true,
              message: "请选择归属医院",
              min: 1
            }
          ]
        }
      },
      stores: {
        manager: {
          query: {
            totalCount: 0,
            pageSize: 20,
            currentPage: 1,
            kw: "",
            isDeleted: 0,
            status: -1,
            sort: [
              {
                direct: "DESC",
                field: "id"
              }
            ]
          },
          sources: {
            isDeletedSources: [
              { value: -1, text: "全部" },
              { value: 0, text: "正常" },
              { value: 1, text: "已删" }
            ],
            statusSources: [
              { value: -1, text: "全部" },
              { value: 0, text: "禁用" },
              { value: 1, text: "正常" }
            ],
            statusFormSources: [
              { value: 0, text: "禁用" },
              { value: 1, text: "正常" }
            ],
            hospitalSources: []
          },
          columns: [
            { type: "selection", width: 30, key: "handle" },
            {
              title: "管理老师编码",
              key: "code",
              width: 120,
              align: "center"
            },
            { title: "管理老师名称", key: "name", width: 150, sortable: true },
            { title: "联系电话", key: "telNo", width: 120 },
            {
              title: "App登录口令",
              key: "appPwd",
              width: 100,
              render: (h, params) => {
                return h(
                  "p",
                  {
                    slot: "content",
                    style: {
                      whiteSpace: "normal"
                    }
                  },
                  "*********"
                );
              }
            },
            {
              title: "归属医院",
              key: "hospitalId",
              width: 120,
              render: (h, params) => {
                let hospitalId = params.row.hospitalId;
                const temp = this.stores.manager.sources.hospitalSources.filter(
                  f => f.value == hospitalId
                );

                let hospitalText = temp.length > 0 ? temp[0]["text"] : "";
                return h(
                  "p",
                  {
                    slot: "content",
                    style: {
                      whiteSpace: "normal"
                    }
                  },
                  hospitalText
                );
              }
            },
            {
              title: "状态",
              key: "status",
              align: "center",
              width: 120,
              render: (h, params) => {
                let status = params.row.status;
                let statusColor = "success";
                let statusText = "正常";
                switch (status) {
                  case 0:
                    statusText = "禁用";
                    statusColor = "default";
                    break;
                }
                return h(
                  "Tooltip",
                  {
                    props: {
                      placement: "top",
                      transfer: true,
                      delay: 500
                    }
                  },
                  [
                    //这个中括号表示是Tooltip标签的子标签
                    h(
                      "Tag",
                      {
                        props: {
                          //type: "dot",
                          color: statusColor
                        }
                      },
                      statusText
                    ), //表格列显示文字
                    h(
                      "p",
                      {
                        slot: "content",
                        style: {
                          whiteSpace: "normal"
                        }
                      },
                      statusText //整个的信息即气泡内文字
                    )
                  ]
                );
              }
            },
            {
              title: "创建时间",
              width: 120,
              ellipsis: true,
              tooltip: true,
              key: "createdOn"
            },
            {
              title: "创建者",
              key: "createdByUserName",
              ellipsis: true,
              tooltip: true
            },
            {
              title: "操作",
              align: "center",
              key: "handle",
              width: 150,
              className: "table-command-column",
              options: ["edit"],
              button: [
                (h, params, vm) => {
                  return h(
                    "Poptip",
                    {
                      props: {
                        transfer: true,
                        confirm: true,
                        title: "你确定要删除吗?"
                      },
                      on: {
                        "on-ok": () => {
                          vm.$emit("on-delete", params);
                        }
                      }
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: {
                            placement: "left",
                            transfer: true,
                            delay: 1000
                          }
                        },
                        [
                          h("Button", {
                            props: {
                              shape: "circle",
                              size: "small",
                              icon: "md-trash",
                              type: "error"
                            }
                          }),
                          h(
                            "p",
                            {
                              slot: "content",
                              style: {
                                whiteSpace: "normal"
                              }
                            },
                            "删除"
                          )
                        ]
                      )
                    ]
                  );
                },
                (h, params, vm) => {
                  return h(
                    "Tooltip",
                    {
                      props: {
                        placement: "left",
                        transfer: true,
                        delay: 1000
                      }
                    },
                    [
                      h("Button", {
                        props: {
                          shape: "circle",
                          size: "small",
                          icon: "md-create",
                          type: "primary"
                        },
                        on: {
                          click: () => {
                            vm.$emit("on-edit", params);
                            vm.$emit("input", params.tableData);
                          }
                        }
                      }),
                      h(
                        "p",
                        {
                          slot: "content",
                          style: {
                            whiteSpace: "normal"
                          }
                        },
                        "编辑"
                      )
                    ]
                  );
                },
                (h, params, vm) => {
                  return h(
                    "Poptip",
                    {
                      props: {
                        transfer: true,
                        confirm: true,
                        title: "你确定要重置App登录口令为[12345]吗?"
                      },
                      on: {
                        "on-ok": () => {
                          vm.$emit("on-reset", params);
                        }
                      }
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: {
                            placement: "left",
                            transfer: true,
                            delay: 1000
                          }
                        },
                        [
                          h("Button", {
                            props: {
                              shape: "circle",
                              size: "small",
                              icon: "md-refresh",
                              type: "warning"
                            }
                          }),
                          h(
                            "p",
                            {
                              slot: "content",
                              style: {
                                whiteSpace: "normal"
                              }
                            },
                            "重置App登录口令"
                          )
                        ]
                      )
                    ]
                  );
                }
              ]
            }
          ],
          data: []
        }
      },
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static"
      }
    };
  },
  computed: {
    formTitle() {
      if (this.formModel.mode === "create") {
        return "创建档案";
      }
      if (this.formModel.mode === "edit") {
        return "编辑档案";
      }
      return "";
    },
    selectedRows() {
      return this.formModel.selection;
    },
    selectedRowsId() {
      return this.formModel.selection.map(x => x.id);
    }
  },
  methods: {
    loadManagerList() {
      getManagerList(this.stores.manager.query).then(res => {
        this.stores.manager.data = res.data.data;
        this.stores.manager.query.totalCount = res.data.totalCount;
      });
    },
    handleOpenFormWindow() {
      this.formModel.opened = true;
    },
    handleCloseFormWindow() {
      this.formModel.opened = false;
    },
    handleSwitchFormModeToCreate() {
      this.formModel.mode = "create";
    },
    handleSwitchFormModeToEdit() {
      this.formModel.mode = "edit";
      this.handleOpenFormWindow();
    },
    handleEdit(params) {
      this.handleSwitchFormModeToEdit();
      this.handleResetFormManager();
      this.doloadManager(params.row.id);
    },
    handleSelect(selection, row) {},
    handleSelectionChange(selection) {
      this.formModel.selection = selection;
    },
    handleRefresh() {
      this.loadManagerList();
    },
    handleShowCreateWindow() {
      this.handleSwitchFormModeToCreate();
      this.handleOpenFormWindow();
      this.handleResetFormManager();
    },
    handleSubmitManager() {
      let valid = this.validateManagerForm();
      if (valid) {
        if (this.formModel.mode === "create") {
          this.doCreateManager();
        }
        if (this.formModel.mode === "edit") {
          this.doEditManager();
        }
      }
    },
    handleResetFormManager() {
      this.$refs["formManager"].resetFields();
    },
    doCreateManager() {
      createManager(this.formModel.fields).then(res => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadManagerList();
          this.handleCloseFormWindow();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    doEditManager() {
      editManager(this.formModel.fields).then(res => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadManagerList();
          this.handleCloseFormWindow();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    validateManagerForm() {
      let _valid = false;
      this.$refs["formManager"].validate(valid => {
        if (!valid) {
          this.$Message.error("请完善表单信息");
          _valid = false;
        } else {
          _valid = true;
        }
      });
      return _valid;
    },
    doloadManager(id) {
      loadManager({ id: id }).then(res => {
        this.formModel.fields = res.data.data;
      });
    },
    handleDelete(params) {
      this.doDelete(params.row.id);
    },
    handleReset(params) {
      this.doReset(params.row.id);
    },
    doDelete(ids) {
      if (!ids) {
        this.$Message.warning("请选择至少一条数据");
        return;
      }
      deleteManager(ids).then(res => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadManagerList();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    doReset(id) {
      resetManagerAppPwd(id).then(res => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadManagerList();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    handleSearchManger() {
      this.loadManagerList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.manager.query.currentPage = page;
      this.loadManagerList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.manager.query.pageSize = pageSize;
      this.loadManagerList();
    },
    handleBatchCommand(command) {
      if (!this.selectedRowsId || this.selectedRowsId.length <= 0) {
        this.$Message.warning("请选择至少一条数据");
        return;
      }
      this.$Modal.confirm({
        title: "操作提示",
        content:
          "<p>确定要执行当前 [" +
          this.commands[command].title +
          "] 操作吗?</p>",
        loading: true,
        onOk: () => {
          this.doBatchCommand(command);
        }
      });
    },
    doBatchCommand(command) {
      batchCommand({
        command: command,
        ids: this.selectedRowsId.join(",")
      }).then(res => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.handleCloseFormWindow();
          this.loadManagerList();
          this.formModel.selection = [];
        } else {
          this.$Message.warning(res.data.message);
        }
        this.$Modal.remove();
      });
    }
  },
  mounted() {
    this.loadManagerList();
    getHospitalSelect()
      .then(res => {
        const { state, data } = res.data;
        if (state == "success") {
          this.stores.manager.sources.hospitalSources = data;
        }
      })
      .catch(err => {});
  }
};
</script>
