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
        v-model="stores.bed.data"
        :totalCount="stores.bed.query.totalCount"
        :columns="stores.bed.columns"
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
                      v-model="stores.bed.query.kw"
                      placeholder="输入关键字搜索..."
                      @on-search="handleSearchManger()"
                    >
                      <Select
                        slot="prepend"
                        v-model="stores.bed.query.isDeleted"
                        @on-change="handleSearchManger"
                        placeholder="删除状态"
                        style="width:60px;"
                      >
                        <Option
                          v-for="item in stores.bed.sources.isDeletedSources"
                          :value="item.value"
                          :key="item.value"
                        >{{item.text}}</Option>
                      </Select>
                      <Select
                        slot="prepend"
                        v-model="stores.bed.query.status"
                        @on-change="handleSearchManger"
                        placeholder="床位状态"
                        style="width:60px;"
                      >
                        <Option
                          v-for="item in stores.bed.sources.statusSources"
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
                  title="新增床位档案"
                >新增床位档案</Button>
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
      <Form :model="formModel.fields" ref="formBed" :rules="formModel.rules">
        <FormItem label="床位编码" prop="code" label-position="left">
          <Input v-model="formModel.fields.code" placeholder="请输入床位编码" />
        </FormItem>
        <FormItem label="床位名称" prop="name" label-position="left">
          <Input v-model="formModel.fields.name" placeholder="请输入床位名称" />
        </FormItem>
        <FormItem label="归属医院" prop="hospitalId" label-position="top">
          <Select
            v-model="formModel.fields.hospitalId"
            placeholder="请选择归属医院"
            @on-change="changeHos"
          >
            <Option
              v-for="item in stores.bed.sources.hospitalSources"
              :value="item.value"
              :key="item.value"
            >{{item.text}}</Option>
          </Select>
        </FormItem>
        <FormItem label="归属病区" prop="areaId" label-position="top">
          <Select v-model="formModel.fields.areaId" placeholder="请选择归属病区">
            <Option
              v-for="item in stores.bed.sources.areaSpecialSources"
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
            placeholder="床位备注信息"
          />
        </FormItem>
      </Form>
      <div class="demo-drawer-footer">
        <Button icon="md-checkmark-circle" type="primary" @click="handleSubmitBed">保 存</Button>
        <Button style="margin-left: 8px" icon="md-close" @click="formModel.opened = false">取 消</Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import Tables from "_c/tables";
import {
  getBedList,
  createBed,
  loadBed,
  editBed,
  deleteBed,
  batchCommand,
} from "@/api/base/bed";
import { getAreaSelect, getAreaSelectAll } from "@/api/base/area";
import { getHospitalSelect } from "@/api/base/hospital";
export default {
  name: "base_bed_page",
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
        title: "创建床位",
        mode: "create",
        selection: [],
        fields: {
          id: 0,
          code: "",
          name: "",
          hospitalId: 0,
          areaId: 0,
          status: 1,
          isDeleted: 0,
          description: "",
        },
        rules: {
          code: [
            {
              type: "string",
              required: true,
              message: "请输入床位编码",
              min: 2,
            },
          ],
          name: [
            {
              type: "string",
              required: true,
              message: "请输入床位名称",
              min: 2,
            },
          ],
          areaId: [
            {
              type: "integer",
              required: true,
              message: "请选择归属病区",
              min: 1,
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
        },
      },
      stores: {
        bed: {
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
            areaSources: [],
            areaSpecialSources: [],
          },
          columns: [
            { type: "selection", width: 30, key: "handle" },
            {
              title: "床位编码",
              key: "code",
              width: 120,
              align: "center",
            },
            { title: "床位名称", key: "name", width: 150, sortable: true },
            {
              title: "归属医院",
              key: "hospitalId",
              width: 120,
              render: (h, params) => {
                let hospitalId = params.row.hospitalId;
                const temp = this.stores.bed.sources.hospitalSources.filter(
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
            {
              title: "归属病区",
              key: "areaId",
              width: 120,
              render: (h, params) => {
                let areaId = params.row.areaId;
                const temp = this.stores.bed.sources.areaSources.filter(
                  (f) => f.value == areaId
                );

                let areaText = temp.length > 0 ? temp[0]["text"] : "";
                return h(
                  "p",
                  {
                    slot: "content",
                    style: {
                      whiteSpace: "normal",
                    },
                  },
                  areaText
                );
              },
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
    loadBedList() {
      getBedList(this.stores.bed.query).then((res) => {
        this.stores.bed.data = res.data.data;
        this.stores.bed.query.totalCount = res.data.totalCount;
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
      this.handleResetFormBed();
      this.doloadBed(params.row.id);
    },
    handleSelect(selection, row) {},
    handleSelectionChange(selection) {
      this.formModel.selection = selection;
    },
    handleRefresh() {
      this.loadBedList();
    },
    handleShowCreateWindow() {
      this.handleSwitchFormModeToCreate();
      this.handleOpenFormWindow();
      this.handleResetFormBed();
    },
    handleSubmitBed() {
      let valid = this.validateBedForm();
      if (valid) {
        if (this.formModel.mode === "create") {
          this.doCreateBed();
        }
        if (this.formModel.mode === "edit") {
          this.doEditBed();
        }
      }
    },
    handleResetFormBed() {
      this.$refs["formBed"].resetFields();
    },
    doCreateBed() {
      createBed(this.formModel.fields).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadBedList();
          this.handleCloseFormWindow();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    doEditBed() {
      editBed(this.formModel.fields).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadBedList();
          this.handleCloseFormWindow();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    validateBedForm() {
      let _valid = false;
      this.$refs["formBed"].validate((valid) => {
        if (!valid) {
          this.$Message.error("请完善表单信息");
          _valid = false;
        } else {
          _valid = true;
        }
      });
      return _valid;
    },
    doloadBed(id) {
      loadBed({ id: id }).then((res) => {
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
      deleteBed(ids).then((res) => {
        if (res.data.code === 200) {
          this.$Message.success(res.data.message);
          this.loadBedList();
        } else {
          this.$Message.warning(res.data.message);
        }
      });
    },
    handleSearchManger() {
      this.loadBedList();
    },
    rowClsRender(row, index) {
      if (row.isDeleted) {
        return "table-row-disabled";
      }
      return "";
    },
    handlePageChanged(page) {
      this.stores.bed.query.currentPage = page;
      this.loadBedList();
    },
    handlePageSizeChanged(pageSize) {
      this.stores.bed.query.pageSize = pageSize;
      this.loadBedList();
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
          this.loadBedList();
          this.formModel.selection = [];
        } else {
          this.$Message.warning(res.data.message);
        }
        this.$Modal.remove();
      });
    },
    changeHos() {
      if (this.formModel.fields.hospitalId) {
        getAreaSelect({ HospitalId: this.formModel.fields.hospitalId })
          .then((res) => {
            const { data, state } = res.data;
            if (state == "success") {
              this.stores.bed.sources.areaSpecialSources = data;
            }
          })
          .catch((err) => {});
      }
    },
  },
  mounted() {
    this.loadBedList();
    getHospitalSelect()
      .then((res) => {
        const { state, data } = res.data;
        if (state == "success") {
          this.stores.bed.sources.hospitalSources = data;
        }
      })
      .catch((err) => {});
    getAreaSelectAll()
      .then((res) => {
        const { data, state } = res.data;
        if (state == "success") {
          this.stores.bed.sources.areaSources = data;
          this.stores.bed.sources.areaSpecialSources = data;
        }
      })
      .catch((err) => {});
  },
};
</script>
