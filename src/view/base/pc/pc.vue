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
        v-model="stores.pc.data"
        :totalCount="stores.pc.query.totalCount"
        :columns="stores.pc.columns"
        @on-delete="handleDelete"
        @on-edit="handleEdit"
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
                      v-model="stores.pc.query.kw"
                      placeholder="输入关键字搜索..."
                      @on-search="handleSearchManger()"
                    >
                      <Select
                        slot="prepend"
                        v-model="stores.pc.query.isDeleted"
                        @on-change="handleSearchManger"
                        placeholder="删除状态"
                        style="width:60px;"
                      >
                        <Option
                          v-for="item in stores.pc.sources.isDeletedSources"
                          :value="item.value"
                          :key="item.value"
                        >{{item.text}}</Option>
                      </Select>
                      <Select
                        slot="prepend"
                        v-model="stores.pc.query.status"
                        @on-change="handleSearchManger"
                        placeholder="护工状态"
                        style="width:60px;"
                      >
                        <Option
                          v-for="item in stores.pc.sources.statusSources"
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
                  title="新增护工档案"
                >新增护工档案</Button>
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
      <Form :model="formModel.fields" ref="formPc" :rules="formModel.rules">
        <FormItem label="护工编码" prop="code" label-position="left">
          <Input v-model="formModel.fields.code" placeholder="请输入护工编码" />
        </FormItem>
        <FormItem label="护工名称" prop="name" label-position="left">
          <Input v-model="formModel.fields.name" placeholder="请输入护工名称" />
        </FormItem>
        <FormItem label="护工身份证号码" prop="idCardNo" label-position="left">
          <Input v-model="formModel.fields.idCardNo" placeholder="请输入护工身份证号码" />
        </FormItem>
        <FormItem label="归属医院" prop="hospitalId" label-position="top">
          <Select
            v-model="formModel.fields.hospitalId"
            placeholder="请选择归属医院"
            @on-change="changeHos"
          >
            <Option
              v-for="item in stores.pc.sources.hospitalSources"
              :value="item.value"
              :key="item.value"
            >{{item.text}}</Option>
          </Select>
        </FormItem>
        <!-- <FormItem label="归属病区" prop="areaId" label-position="top">
          <Select v-model="formModel.fields.areaId" placeholder="请选择归属病区">
            <Option
              v-for="item in stores.pc.sources.areaSources"
              :value="item.value"
              :key="item.value"
            >{{item.text}}</Option>
          </Select>
        </FormItem>-->
        <!-- <FormItem label="管理老师" prop="managerId" label-position="top">
          <Select v-model="formModel.fields.managerId" placeholder="请选择管理老师">
            <Option
              v-for="item in stores.pc.sources.managerSpecialSources"
              :value="item.value"
              :key="item.value"
            >{{item.text}}</Option>
          </Select>
        </FormItem> -->
        <FormItem label="备注" label-position="top" prop="description">
          <Input
            type="textarea"
            v-model="formModel.fields.description"
            :rows="4"
            placeholder="护工备注信息"
          />
        </FormItem>
      </Form>
      <div class="demo-drawer-footer">
        <Button icon="md-checkmark-circle" type="primary" @click="handleSubmitPc">保 存</Button>
        <Button style="margin-left: 8px" icon="md-close" @click="formModel.opened = false">取 消</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import Tables from "_c/tables";
import {
  getPcList,
  createPc,
  loadPc,
  editPc,
  deletePc,
  batchCommand,
} from "@/api/base/pc";
import { getHospitalSelect } from "@/api/base/hospital";
import { getAreaSelect, getAreaSelectAll } from "@/api/base/area";
import { getManagerSelect, getManagerSelectAll } from "@/api/base/manager";
export default {
  name: "base_pc_page",
  components: {
    Tables,
  },
  data() {
    return {
      commands: {
        delete: { name: "delete", title: "删除" },
        recover: { name: "recover", title: "恢复" },
        forbidden: { name: "forbidden", title: "禁用" },
        normal: { name: "normal", title: "启用" },
      },
      formModel: {
        opened: false,
        title: "创建护工",
        mode: "create",
        selection: [],
        fields: {
          id: 0,
          code: "",
          name: "",
          idCardNo: "",
          hospitalId: 0,
          areaId: -1,
          managerId: -1,
          status: 1,
          isDeleted: 0,
          description: "",
        },
        rules: {
          code: [
            {
              type: "string",
              required: true,
              message: "请输入护工编码",
              min: 2,
            },
          ],
          name: [
            {
              type: "string",
              required: true,
              message: "请输入护工名称",
              min: 2,
            },
          ],
          idCardNo: [
            {
              type: "string",
              required: true,
              message: "请输入护工身份证号码",
              min: 15,
              max: 18,
            },
          ],
          areaId: [
            {
              type: "integer",
              required: true,
              message: "请选择归属病区",
              min: -1,
            },
          ],
          hospitalId: [
            {
              type: "integer",
              required: true,
              message: "请选择归属医院",
              min: 1,
            },
          ],
          managerId: [
            {
              type: "integer",
              required: true,
              message: "请选择默认管理老师",
              min: -1,
            },
          ],
        },
      },
      stores: {
        pc: {
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
                field: "id",
              },
            ],
          },
          sources: {
            isDeletedSources: [
              { value: -1, text: "全部" },
              { value: 0, text: "正常" },
              { value: 1, text: "已删" },
            ],
            statusSources: [
              { value: -1, text: "全部" },
              { value: 0, text: "禁用" },
              { value: 1, text: "正常" },
            ],
            statusFormSources: [
              { value: 0, text: "禁用" },
              { value: 1, text: "正常" },
            ],
            hospitalSources: [],
            managerSources: [],
            managerSpecialSources: [],
            areaSources: [],
          },
          columns: [
            { type: "selection", width: 30, key: "handle" },
            {
              title: "护工编码",
              key: "code",
              width: 120,
              align: "center",
            },
            { title: "护工名称", key: "name", width: 150, sortable: true },
            {
              title: "护工身份证号码",
              key: "idCardNo",
              width: 200,
              sortable: true,
            },
            {
              title: "归属医院",
              key: "hospitalId",
              width: 120,
              render: (h, params) => {
                let hospitalId = params.row.hospitalId;
                const temp = this.stores.pc.sources.hospitalSources.filter(
                  (f) => f.value == hospitalId
                );

                let hospitalText = temp.length > 0 ? temp[0]["text"] : "";
                return h(
                  "p",
                  {
                    slot: "content",
                    style: {
                      whiteSpace: "normal",
                    },
                  },
                  hospitalText
                );
              },
            },
            // {
            //   title: "归属病区",
            //   key: "areaId",
            //   width: 120,
            //   render: (h, params) => {
            //     let areaId = params.row.areaId;
            //     const temp = this.stores.pc.sources.areaSources.filter(
            //       f => f.value == areaId
            //     );

            //     let areaText = temp.length > 0 ? temp[0]["text"] : "";
            //     return h(
            //       "p",
            //       {
            //         slot: "content",
            //         style: {
            //           whiteSpace: "normal"
            //         }
            //       },
            //       areaText
            //     );
            //   }
            // },
            // {
            //   title: "管理老师",
            //   key: "managerId",
            //   width: 120,
            //   render: (h, params) => {
            //     let managerId = params.row.managerId;
            //     const temp = this.stores.pc.sources.managerSources.filter(
            //       (f) => f.value == managerId
            //     );

            //     let managerText = temp.length > 0 ? temp[0]["text"] : "";
            //     return h(
            //       "p",
            //       {
            //         slot: "content",
            //         style: {
            //           whiteSpace: "normal",
            //         },
            //       },
            //       managerText
            //     );
            //   },
            // },
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
                      delay: 500,
                    },
                  },
                  [
                    //这个中括号表示是Tooltip标签的子标签
                    h(
                      "Tag",
                      {
                        props: {
                          //type: "dot",
                          color: statusColor,
                        },
                      },
                      statusText
                    ), //表格列显示文字
                    h(
                      "p",
                      {
                        slot: "content",
                        style: {
                          whiteSpace: "normal",
                        },
                      },
                      statusText //整个的信息即气泡内文字
                    ),
                  ]
                );
              },
            },
            {
              title: "创建时间",
              width: 120,
              ellipsis: true,
              tooltip: true,
              key: "createdOn",
            },
            {
              title: "创建者",
              key: "createdByUserName",
              ellipsis: true,
              tooltip: true,
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
                        title: "你确定要删除吗?",
                      },
                      on: {
                        "on-ok": () => {
                          vm.$emit("on-delete", params);
                        },
                      },
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: {
                            placement: "left",
                            transfer: true,
                            delay: 1000,
                          },
                        },
                        [
                          h("Button", {
                            props: {
                              shape: "circle",
                              size: "small",
                              icon: "md-trash",
                              type: "error",
                            },
                          }),
                          h(
                            "p",
                            {
                              slot: "content",
                              style: {
                                whiteSpace: "normal",
                              },
                            },
                            "删除"
                          ),
                        ]
                      ),
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
                        delay: 1000,
                      },
                    },
                    [
                      h("Button", {
                        props: {
                          shape: "circle",
                          size: "small",
                          icon: "md-create",
                          type: "primary",
                        },
                        on: {
                          click: () => {
                            vm.$emit("on-edit", params);
                            vm.$emit("input", params.tableData);
                          },
                        },
                      }),
                      h(
                        "p",
                        {
                          slot: "content",
                          style: {
                            whiteSpace: "normal",
                          },
                        },
                        "编辑"
                      ),
                    ]
                  );
                },
              ],
            },
          ],
          data: [],
        },
      },
      styles: {
        height: "calc(100% - 55px)",
        overflow: "auto",
        paddingBottom: "53px",
        position: "static",
      },
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
      return this.formModel.selection.map((x) => x.id);
    },
  },
  methods: {
    loadPcList() {
      getPcList(this.stores.pc.query).then((res) => {
        this.stores.pc.data = res.data.data;
        this.stores.pc.query.totalCount = res.data.totalCount;
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
      this.handleResetFormPc();
      this.doloadPc(params.row.id);
    },
    handleSelect(selection, row) {},
    handleSelectionChange(selection) {
      this.formModel.selection = selection;
    },
    handleRefresh() {
      this.loadPcList();
    },
    handleShowCreateWindow() {
      this.handleSwitchFormModeToCreate();
      this.handleOpenFormWindow();
      this.handleResetFormPc();
    },
    handleSubmitPc() {
      let valid = this.validatePcForm();
      if (valid) {
        if (this.formModel.mode === "create") {
          this.doCreatePc();
        }
        if (this.formModel.mode === "edit") {
          this.doEditPc();
        }
      }
    },
    handleResetFormPc() {
      this.$refs["formPc"].resetFields();
    },
    doCreatePc() {
      createPc(this.formModel.fields).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadPcList();
          this.handleCloseFormWindow();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    doEditPc() {
      editPc(this.formModel.fields).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadPcList();
          this.handleCloseFormWindow();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    validatePcForm() {
      let _valid = false;
      this.$refs["formPc"].validate((valid) => {
        if (!valid) {
          this.$Message.error("请完善表单信息");
          _valid = false;
        } else {
          _valid = true;
        }
      });
      return _valid;
    },
    doloadPc(id) {
      loadPc({ id: id }).then((res) => {
        this.formModel.fields = res.data.data;
      });
    },
    handleDelete(params) {
      this.doDelete(params.row.id);
    },
    doDelete(ids) {
      if (!ids) {
        this.$Message.warning("请选择至少一条数据");
        return;
      }
      deletePc(ids).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadPcList();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    handleSearchManger() {
      this.loadPcList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.pc.query.currentPage = page;
      this.loadPcList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.pc.query.pageSize = pageSize;
      this.loadPcList();
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
        },
      });
    },
    doBatchCommand(command) {
      batchCommand({
        command: command,
        ids: this.selectedRowsId.join(","),
      }).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.handleCloseFormWindow();
          this.loadPcList();
          this.formModel.selection = [];
        } else {
          this.$Message.warning(res.data.message);
        }
        this.$Modal.remove();
      });
    },
    changeHos(val) {
      // getAreaSelect({ HospitalId: this.formModel.fields.hospitalId })
      //   .then((res) => {
      //     const { data, state } = res.data;
      //     if (state == "success") {
      //       this.stores.pc.sources.areaSources = data;
      //     }
      //   })
      //   .catch((err) => {});
      // if (this.formModel.fields.hospitalId) {
      //   getManagerSelect({ HospitalId: this.formModel.fields.hospitalId })
      //     .then((res) => {
      //       const { data, state } = res.data;
      //       if (state == "success") {
      //         this.stores.pc.sources.managerSpecialSources = data;
      //       }
      //     })
      //     .catch((err) => {});
      // }
    },
  },
  mounted() {
    this.loadPcList();
    getHospitalSelect()
      .then((res) => {
        const { state, data } = res.data;
        if (state == "success") {
          this.stores.pc.sources.hospitalSources = data;
        }
      })
      .catch((err) => {});
    // getAreaSelectAll()
    //   .then((res) => {
    //     const { data, state } = res.data;
    //     if (state == "success") {
    //       this.stores.pc.sources.areaSources = data;
    //     }
    //   })
    //   .catch((err) => {});
    // getManagerSelectAll()
    //   .then((res) => {
    //     const { data, state } = res.data;
    //     if (state == "success") {
    //       this.stores.pc.sources.managerSources = data;
    //       this.stores.pc.sources.managerSpecialSources = data;
    //     }
    //   })
    //   .catch((err) => {});
  },
};
</script>
