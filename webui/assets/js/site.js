const LSBC = {};

const EMPTYSTR = '';
const APIGuide = {
    "Cluster": {
        "path": "/libreapi/cluster"
    },
    // BASE
    "NetAlias": {
        "path": "/libreapi/base/netalias",
        "presentation-html": "netalias-table",
        "sample": {
            "name": "netalias_name",
            "desc": "description",
            "addresses": [
                {
                    "member": "nodeid",
                    "listen": "listen_ip_address",
                    "advertise": "advertise_ip_address"
                }
            ]
        }
    },
    "AccessControl": {
        "path": "/libreapi/base/acl",
        "presentation-html": "acl-table",
        "sample": {
            "name": "acl_name",
            "desc": "description",
            "action": "deny",
            "rules": [
                {
                    "action": "allow",
                    "key": "cidr",
                    "value": "ip_network_address"
                }
            ]
        }
    },
    // CLASS
    "MediaClass": {
        "path": "/libreapi/class/media",
        "presentation-html": "media-class-table",
        "sample": {
            "name": "media_class_name",
            "desc": "description",
            "codecs": [
                "PCMA",
                "PCMU",
                "OPUS",
                "G729",
                "AMR-WB",
                "GSM"
            ]
        }
    },
    "CapacityClass": {
        "path": "/libreapi/class/capacity",
        "presentation-html": "capacity-class-table",
        "sample": {
            "name":"capacity_class_name",
            "desc": "description",
            "cps": -1,
            "concurentcalls": -1
        }
    },
    "TranslationClass": {
        "path": "/libreapi/class/translation",
        "presentation-html": "translation-class-table",
        "sample": {
            "name":"translation_class_name",
            "desc": "description",
            "caller_number_pattern": "^([0-9]+)$",
            "caller_number_replacement": "+%{1}",
            "destination_number_pattern": "",
            "destination_number_replacement": "",
            "caller_name": "_auto"
        }
    },
    "ManipulationClass": {
        "path": "/libreapi/class/manipulation",
        "presentation-html": "manipulation-class-table",
        "sample": {
            "name":"manipulation_class_name",
            "desc": "description",
            "actions": [
                    {
                    "action": "action",
                    "targetvar": "variable",
                    "values": [
                        "value"
                    ]
                }
            ]
        }
    },
    "PreAnswerClass": {
        "path": "/libreapi/class/preanswer",
        "presentation-html": "preanswer-class-table",
        "sample": {
            "name": "preanswer_class_name",
            "desc": "description",
            "streams": [
                {
                    "type": "signal/tone/media/speak",
                    "stream": "ring_ready/tone/mediafile"
                }
            ]
        }
    },
    // INTERCONECTION
    "SIPProfile": {
        "path": "/libreapi/sipprofile",
        "presentation-html": "sipprofile-table",
        "sample": {
            "name": "sip_profile_name",
            "desc": "description",
            "user_agent": "LibreSBC",
            "sdp_user": "LibreSBC",
            "local_network_acl": "rfc1918.auto",
            "enable_100rel": true,
            "ignore_183nosdp": true,
            "sip_options_respond_503_on_busy": false,
            "disable_transfer": true,
            "manual_redirect": true,
            "enable_3pcc": false,
            "enable_compact_headers": false,
            "dtmf_type": "rfc2833",
            "media_timeout": 0,
            "rtp_rewrite_timestamps": true,
            "context": "carrier",
            "sip_port": 5060,
            "addrdetect": "none",
            "sip_address": "netalias_name",
            "rtp_address": "netalias_name",
            "tls": false,
            "tls_only": false,
            "sips_port": 5061,
            "tls_version": "tlsv1.2"
        }
    },
    "Inbound": {
        "path": "/libreapi/interconnection/inbound",
        "presentation-html": "inbound-intcon-table",
        "sample": {
            "name": "inbound_interconnection_name",
            "desc": "description",
            "sipprofile": "sip_profile_name",
            "routing": "routing_table_name",
            "sipaddrs": [
                "farend_sip_signaling_ip_network_address"
            ],
            "rtpaddrs": [
                "farend_rtp_media_ip_network_address"
            ],
            "ringready": false,
            "media_class": "media_class",
            "capacity_class": "capacity_class",
            "translation_classes": [],
            "manipulation_classes": [],
            "authscheme": "IP",
            "nodes": [
                "_ALL_"
            ],
            "enable": true
        }
    },
    "Outbound": {
        "path": "/libreapi/interconnection/outbound",
        "presentation-html": "outbound-intcon-table",
        "sample": {
            "name": "outbound_interconnection_name",
            "desc": "description",
            "sipprofile": "sip_profile_name",
            "sipaddrs": [
                "farend_sip_media_ip_network_address"],
            "rtpaddrs": [
                "farend_rtp_media_ip_network_address"
            ],
            "media_class": "media_class",
            "capacity_class": "capacity_class",
            "translation_classes": [],
            "manipulation_classes": [],
            "privacy": [
                "none"
            ],
            "cid_type": "none",
            "nofailover_sip_codes": [],
            "distribution": "weight_based",
            "gateways": [
              {
                "name": "gateway_name",
                "weight": 1
              }
            ],
            "nodes": [
                "_ALL_"
            ],
            "enable": true,
        }
    },
    "Gateway": {
        "path": "/libreapi/base/gateway",
        "presentation-html": "gateway-table",
        "sample":{
            "name": "gateway_name",
            "desc": "description",
            "username": "none",
            "password": "none",
            "proxy": "farend_sip_signaling_ip_address",
            "port": 5060,
            "transport": "udp",
            "do_register": false,
            "caller_id_in_from": true,
            "cid_type": "none",
            "ping": 600
        }
    },
    // ACCESS LAYER
    "AccessService": {
        "path": "/libreapi/access/service",
        "presentation-html": "access-service-table",
        "sample": {
            "name": "name",
            "desc": "description",
            "trying_reason": "LibreSBC Trying",
            "natping_from": "sip:keepalive@libresbc",
            "topology_hiding": "hide.topo",
            "whiteips":[],
            "blackips":[],
            "antiflooding": {
                "sampling": 2,
                "density": 20,
                "window": 600,
                "threshold": 3,
                "bantime": 600
            },
            "authfailure": {
                "window": 600,
                "threshold": 18,
                "bantime": 900
            },
            "attackavoid": {
                "window": 18000,
                "threshold": 3,
                "bantime": 7200
            },
            "transports": [
                "udp",
                "tcp"
            ],
            "sip_address": "netalias_name",
            "domains": [
                "libre.sbc"
            ]
        }
    },
    "AccessDomainPolicy": {
        "path": "/libreapi/access/domain-policy",
        "presentation-html": "access-domain-presentation-object",
        "sample": {
            "domain": "libre.sbc",
            "srcsocket": {
                "ip": "127.0.0.3"
            },
            "dstsocket": {
                "ip": "127.0.0.2"
            }
        }
    },
    "AccessUserDirectory": {
        "path": "/libreapi/access/directory/user",
        "presentation-html": null,
        "sample": {
            "domain": "libre.sbc",
            "id": "joebiden",
            "secret": "p@ssword"
        }
    },
    // ROUTING
    "RoutingTable": {
        "path": "/libreapi/routing/table",
        "presentation-html": "routing-presentation-object",
        "sample": 	{
            "name": "routing_table_name",
            "desc": "description",
            "action": "route/block/query/httpr",
            "navigator": null,
            "variables": ["cidnumber", "cidname", "dstnumber", "intconname", "realm"],
            "routes": {
                "primary": "primary_endpoint",
                "secondary": "secondary_endpoint",
                "load": 100
            }
        }
    },
    "RoutingRecord": {
        "path": "/libreapi/routing/record",
        "presentation-html": null,
        "sample": 	{
            "table": "routing_table_name",
            "match": "em/lpm/eq/ne/gt/lt",
            "value": "reference_value",
            "action": "route/block/jumps",
            "routes": {
                "primary": "primary_endpoint",
                "secondary": "secondary_endpoint",
                "load": 50
            }
        }
    },
};

var ConfigDetailTextH = document.getElementById("config-detail");
var ConfigSubmitBntH = document.getElementById("config-submit");
var PanelLabelH = document.getElementById("offcanvaspanel-label");
var offcanvaspanel;
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
/*---------------------------------------------------------------------------*/

function GetHealthStatus() {
    $.ajax({
        type: "GET",
        url: '/libreapi/health',
        success: function(data) {
            function setService(key, status, detail) {
                var dot = document.getElementById('health-dot-' + key);
                var det = document.getElementById('health-detail-' + key);
                if (dot) { dot.className = 'lsbc-health-dot ' + status; }
                if (det) { det.textContent = detail; }
            }
            setService('redis',
                data.redis.status,
                data.redis.status === 'up'
                    ? data.redis.used_memory_human + ' mem · ' + data.redis.latency_ms + 'ms'
                    : (data.redis.error || 'down'));
            var fsNodes = data.freeswitch || [];
            var fsUp = fsNodes.filter(function(n){ return n.status === 'up'; }).length;
            setService('freeswitch',
                fsUp === fsNodes.length && fsNodes.length > 0 ? 'up' : fsNodes.length === 0 ? 'unknown' : 'down',
                fsNodes.length === 0 ? 'no nodes'
                    : fsNodes.map(function(n){ return n.nodeid + ': ' + n.status; }).join(' · '));
            setService('liberator', data.liberator.status, data.liberator.version);
            var calls = data.active_calls || {};
            var total = document.getElementById('health-calls-total');
            var detail = document.getElementById('health-calls-detail');
            if (total) total.textContent = calls.total != null ? calls.total : '—';
            if (detail) detail.textContent = 'in: ' + (calls.inbound || 0) + '  out: ' + (calls.outbound || 0);
            var cps = document.getElementById('health-cps');
            if (cps) cps.textContent = calls.cps != null ? calls.cps : '—';
            var updated = document.getElementById('health-updated');
            if (updated) updated.textContent = 'updated ' + new Date().toLocaleTimeString();
        },
        error: function() {
            ['redis','freeswitch','liberator'].forEach(function(k) {
                var dot = document.getElementById('health-dot-' + k);
                if (dot) dot.className = 'lsbc-health-dot down';
            });
        }
    });
}

function GetPresentNode(){
    $.ajax({
        type: "GET",
        url: '/libreapi/predefine',
        success: function (data) {
            let CandidateHtml = EMPTYSTR;
            (data.candidates || []).forEach((element) => {
                CandidateHtml = `${CandidateHtml}<span class="badge bg-secondary rounded-pill" id="cdr-bucket">${element}</span>`;
            });
            document.getElementById('node-info').innerHTML = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                Software Version <span class="badge bg-success rounded-pill">${data.swversion}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                NodeID <span class="badge bg-danger rounded-pill">${data.nodeid}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                Node Candidates
                <div>${CandidateHtml}</div></li>`;
        },
        error: function(jqXHR) {
            document.getElementById('node-info').innerHTML = EMPTYSTR;
            LSBC.ajaxError(jqXHR);
        }
    });

    $.ajax({
        type: "GET",
        url: '/libreapi/cluster',
        success: function (data) {
            let MembersHtml = EMPTYSTR;
            data.members.forEach((element) => {
                MembersHtml = `${MembersHtml}<span class="badge bg-dark rounded-pill" id="cdr-bucket">${element}</span>`;
            });
            document.getElementById('cluster-info').innerHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
            Cluster Name <span class="badge bg-warning text-dark rounded-pill">${data.name}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                Members
                <div>
                ${MembersHtml}
                </div>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                Soft Capacity
                <div>
                <span class="badge bg-primary rounded-pill">cps: ${data.max_calls_per_second}</span>
                <span class="badge bg-primary rounded-pill">concurrent call: ${data.max_concurrent_calls}</span>
                </div>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                RTP Ranges
                <div>
                <span class="badge bg-light text-dark rounded-pill" id="cdr-bucket">${data.rtp_start_port}-${data.rtp_end_port}</span>
            </div>`;
        },
        error: function(jqXHR) {
            document.getElementById('cluster-info').innerHTML = EMPTYSTR;
            LSBC.ajaxError(jqXHR);
        }
    });

    GetHealthStatus();
    LSBC.autoRefresh.start('health', GetHealthStatus, 30000);
}

function enrichIntconStatus(presentation, direction) {
    var tableId = presentation + '-table';
    if ($('#' + tableId + ' thead th.lsbc-live-col').length === 0) {
        $('#' + tableId + ' thead tr').append('<th scope="col" class="lsbc-live-col">Live</th>');
    }
    $('#' + tableId + ' tbody tr').each(function() {
        var name = $(this).find('[data-lsbc-name]').first().data('lsbc-name');
        $(this).append('<td id="intcon-status-' + name + '"><span class="text-muted small">…</span></td>');
    });
    $.ajax({
        type: 'GET', url: '/libreapi/interconnection/status', global: false,
        success: function(statusData) {
            var dirData = statusData[direction] || {};
            $('#' + tableId + ' tbody tr').each(function() {
                var name = $(this).find('[data-lsbc-name]').first().data('lsbc-name');
                var d = dirData[name] || {};
                var cell = document.getElementById('intcon-status-' + name);
                if (!cell) return;
                var calls = d.active_calls != null ? d.active_calls : 0;
                var maxCalls = d.max_calls;
                var html;
                if (maxCalls != null && maxCalls > 0) {
                    var pct = Math.min(100, Math.round(calls / maxCalls * 100));
                    var barClass = pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-success';
                    html = '<div class="small">' + calls + '<span class="text-muted">/' + maxCalls + '</span></div>' +
                        '<div class="progress mt-1" style="height:4px;min-width:60px">' +
                        '<div class="progress-bar ' + barClass + '" style="width:' + pct + '%"></div>' +
                        '</div>';
                } else {
                    html = '<span class="badge ' + (calls > 0 ? 'bg-success' : 'bg-secondary') + '">' + calls + ' calls</span>';
                }
                if (direction === 'outbound' && d.gateways) {
                    html += '<div class="mt-1 d-flex gap-1 flex-wrap align-items-center">';
                    Object.entries(d.gateways).forEach(function(entry) {
                        var gw = entry[0], state = entry[1];
                        var cls = state === 'REGED' ? 'up' : state === 'TRYING' ? 'unknown' : 'down';
                        html += '<span class="lsbc-health-dot ' + cls + '" data-bs-toggle="tooltip" data-bs-title="' + LSBC.escapeAttr(gw) + ': ' + LSBC.escapeAttr(state) + '"></span>';
                    });
                    html += '<button class="btn btn-outline-secondary btn-sm lsbc-gw-rescan ms-1 py-0 px-1" data-lsbc-name="' + LSBC.escapeAttr(name) + '" data-bs-toggle="tooltip" data-bs-title="Rescan gateways" style="font-size:0.7rem;line-height:1.2">↺</button>';
                    html += '</div>';
                }
                cell.innerHTML = html;
            });
            $('#' + tableId + ' .lsbc-health-dot, #' + tableId + ' .lsbc-gw-rescan').each(function() {
                new bootstrap.Tooltip(this);
            });
        }
    });
}

function GeneralGetPresent(SettingName){
    let path = APIGuide[SettingName]['path']
    let presentation = APIGuide[SettingName]["presentation-html"]
    $.ajax({
        type: "GET",
        url: path,
        success: function (data) {
            if (SettingName === 'RoutingTable'){
                RoutingTablePresentData(data, presentation);
            }
            else if (SettingName === 'AccessDomainPolicy'){
                AccessDomainPresentData(data, presentation);
            }
            else{
                GeneralPresentData(data, SettingName, presentation);
            }
            if (SettingName === 'Inbound') enrichIntconStatus(presentation, 'inbound');
            if (SettingName === 'Outbound') enrichIntconStatus(presentation, 'outbound');
        },
        error: function(jqXHR) {
            document.getElementById(presentation).innerHTML = EMPTYSTR;
            LSBC.ajaxError(jqXHR);
        }
    });
}

function GeneralPresentData(DataList, SettingName, presentation){
    let tablebody = EMPTYSTR;
    let cnt = 1;
    DataList.forEach((element) => {
        let name = element.name;
        let desc = element.desc;
        htmltb = `
        <tr>
        <td>${cnt}</td>
        <td>${name}</td>
        <td>${desc}</td>
        <td>
          <button class="btn btn-danger btn-sm" type="button" data-lsbc-action="remove" data-lsbc-name="${LSBC.escapeAttr(name)}" data-lsbc-setting="${LSBC.escapeAttr(SettingName)}"><i class="fa fa-times-circle"></i></button>
          <button class="btn btn-success btn-sm" type="button" data-lsbc-action="modify" data-lsbc-name="${LSBC.escapeAttr(name)}" data-lsbc-setting="${LSBC.escapeAttr(SettingName)}"><i class="fa fa-pencil"></i></button>
        </td>
        </tr>`;
        tablebody = tablebody + htmltb;
        cnt++;
    });
    document.getElementById(presentation).innerHTML = `
        <input type="text" class="form-control form-control-sm mb-2 lsbc-filter" placeholder="Filter ${SettingName}..." id="${presentation}-filter">
        <table class="table" id="${presentation}-table">
          <thead class="table-light">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Description</th>
            <th scope="col"> </th>
          </tr>
          </thead>
          <tbody>
            ${tablebody}
          </tbody>
        </table>
        <div id="${presentation}-table-pagination"></div>`;
    LSBC.filter.attach('#' + presentation + '-filter', presentation + '-table');
    LSBC.paginate.attach(presentation + '-table', 25);
}

// remove button
function GeneralRemove(name, SettingName){
    let path = APIGuide[SettingName]['path']
    $.ajax({
        type: "DELETE",
        url: `${path}/${name}`,
        success: function (data) {
            ShowToast(`Delete Successfully ${SettingName} ${name}`, "info");
            GeneralGetPresent(SettingName);
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}

// modify/update button
function GeneralModify(name, SettingName){
    let path = APIGuide[SettingName]['path']
    let url = APIGuide[SettingName]['path'] + "/" + name
    if (name===EMPTYSTR) {
        url = path;
    }
    $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
            ShowToast(`Detailize Successfully ${SettingName} ${name}`, "info");
            // canvas
            if (SettingName === 'AccessDomainPolicy'){
                PresentCanvas(data, name, SettingName, 'PATCH');
            }else{
                PresentCanvas(data, name, SettingName, 'PUT');
            }
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}

// submit button in canvas
function GeneralSubmit(name, SettingName, method="POST"){
    let path = APIGuide[SettingName]['path'];
    let jsonstring = LSBC.editor.getValue() || ConfigDetailTextH.value;

    // create or update
    let url = path;
    if (method === 'PUT'){
        url = `${path}/${name}`
    }
    if (name===EMPTYSTR) {
        url = path;
    }

    // for modify special API such as [cluster]
    if (SettingName==='RoutingRecord') {
        url = path;
    }

    try { JSON.parse(jsonstring); } catch(e) { ShowToast('Invalid JSON: ' + e.message, 'danger'); return; }

    $.ajax({
        type: method,
        url: url,
        dataType: "json",
        contentType: 'application/json',
        data: jsonstring,
        success: function (data) {
            ShowToast("Data has been submited", "info");
            if (SettingName === 'Cluster'){
                GetPresentNode();
            } else if (SettingName === 'RoutingRecord') {
                RoutingTableDetail(name);
            } else if (SettingName === 'AccessUserDirectory'){
                AccessUserDirectoryDetail(name);
            } else {
                GeneralGetPresent(SettingName);
            }
            offcanvaspanel.hide();
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}

// create button
function GeneralCreate(SettingName, ObjectName=EMPTYSTR){
    let sample = APIGuide[SettingName]['sample'];
    if (SettingName === 'RoutingRecord'){
        sample['table'] = ObjectName;
    }
    // canvas
    PresentCanvas(sample, ObjectName, SettingName, 'POST');
}

// --------------------------------------------------
// ACCESS DOMAIN
// --------------------------------------------------

// Access domain policy+user presentation
function AccessDomainPresentData(data, presentation){
    let AccessDomainHtml = EMPTYSTR;
    let cnt = 0;
    data.forEach((Adomain) => {
        adomainhtml = `
        <div class="accordion-item">
          <h2 class="accordion-header" data-bs-title="show detail">
            <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseAD${Adomain}">
              <span class="badge rounded-pill text-bg-primary">${cnt}</span>&nbsp;&nbsp;
              <span class="text-primary fw-bolder">${Adomain}</span>
            </button>
          </h2>
        <div id="collapseAD${Adomain}" class="accordion-collapse collapse">
          <div class="accordion-body">
            <div class="row">
              <div class="col-md-6 col-lg-6">
                <div class="row">
                  <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary text-start" data-lsbc-action="load-policy" data-lsbc-name="${LSBC.escapeAttr(Adomain)}"><i class="fa fa-refresh"></i> Load Policy</button>
                    <button type="button" class="btn btn-outline-primary text-start" data-lsbc-action="modify" data-lsbc-name="${LSBC.escapeAttr(Adomain)}" data-lsbc-setting="AccessDomainPolicy"><i class="fa fa-pencil-square-o"></i> Update Policy</button>
                    <button type="button" class="btn btn-outline-danger text-start" data-lsbc-action="remove" data-lsbc-name="${LSBC.escapeAttr(Adomain)}" data-lsbc-setting="AccessDomainPolicy"><i class="fa fa-trash"></i> Delete Policy</button>
                  </div>
                </div>
                <br>
                <div class="row">
                  <div class="col-md-12 col-lg-12" id="DetailAD${Adomain}"></div>
                </div>
              </div>
              <div class="col-md-6 col-lg-6">
                <div class="row g-3 justify-content-end">
                  <div class="col-md-6 col-lg-6">
                    <div class="btn-group" role="group">
                      <button type="button" class="btn btn-primary text-start" data-lsbc-action="create" data-lsbc-setting="AccessUserDirectory" data-lsbc-name="${LSBC.escapeAttr(Adomain)}"><i class="fa fa-plus-square-o"></i> Create User</button>
                      <button type="button" class="btn btn-primary text-start" data-lsbc-action="load-users" data-lsbc-name="${LSBC.escapeAttr(Adomain)}"><i class="fa fa-refresh"></i> Load Users</button>
                    </div>
                  </div>
                </div>
                <br>
                <div class="row">
                  <div class="col-md-12 col-lg-12" id="TableAD${Adomain}"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>`
        AccessDomainHtml = AccessDomainHtml + adomainhtml;
        cnt = cnt+1;
    });
    document.getElementById(presentation).innerHTML = AccessDomainHtml;
}

// Access domain policy show detail
function AccessDomainPolicyDetail(Adomain){
    $.ajax({
        type: "GET",
        url: `/libreapi/access/domain-policy/${Adomain}`,
        success: function (data) {
            document.getElementById(`DetailAD${Adomain}`).innerHTML = `
            <div class="card border-primary">
              <div class="card-body text-primary">
                <pre><code>${JSON.stringify(data, undefined, 4)}</code></pre>
              </div>
            </div>`;
        },
        error: function(jqXHR) {
            document.getElementById(`DetailAD${Adomain}`).innerHTML = EMPTYSTR;
            LSBC.ajaxError(jqXHR);
        }
    });
}

// Access user directory list all user
function AccessUserDirectoryDetail(Adomain){
    $.ajax({
        type: "GET",
        url: `/libreapi/access/directory/user/${Adomain}`,
        success: function (data) {
            let usertable = EMPTYSTR;
            let cnt = 1;
            users = [];
            if (Adomain in data){
                users = data[Adomain];
            }
            users.forEach((user)=>{
                userhtml = `
                <tr>
                  <td>${cnt}</td> <td>${user}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" type="button" data-lsbc-action="remove-access-user" data-lsbc-domain="${LSBC.escapeAttr(Adomain)}" data-lsbc-name="${LSBC.escapeAttr(user)}"><i class="fa fa-times-circle"></i></button>
                    <button class="btn btn-success btn-sm" type="button" data-lsbc-action="update-access-user" data-lsbc-domain="${LSBC.escapeAttr(Adomain)}" data-lsbc-name="${LSBC.escapeAttr(user)}"><i class="fa fa-pencil"></i></button>
                  </td>
                </tr>`;
                usertable = usertable + userhtml;
                cnt++;
            });
            if (users.length!==0){
                document.getElementById(`TableAD${Adomain}`).innerHTML = `
                <table class="table table-hover">
                <thead class="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">User</th>
                  <th scope="col"></th>
                </tr>
                </thead>
                  <tbody>
                  ${usertable}
                  </tbody>
                </table>`;
            } else {
                document.getElementById(`TableAD${Adomain}`).innerHTML = EMPTYSTR;
            }
        },
        error: function(jqXHR) {
            document.getElementById(`TableAD${Adomain}`).innerHTML = EMPTYSTR;
            LSBC.ajaxError(jqXHR);
        }
    });
}

// Access user directory remove user
function RemoveAccessUser(domain, user){
    let SettingName = 'AccessUserDirectory';
    let path = APIGuide[SettingName]['path']
    $.ajax({
        type: "DELETE",
        url: `${path}/${domain}/${user}`,
        success: function (data) {
            ShowToast(`Delete Successfully ${SettingName} ${user}@${domain}`, "info");
            AccessUserDirectoryDetail(domain);
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}

// Access user directory partial update user
function UpdateAccessUser(domain, user){
    let SettingName = 'AccessUserDirectory';
    let url = APIGuide[SettingName]['path'] + "/" + domain + "/" + user;
    $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
            let userdata = {
                "domain": domain,
                "id": user,
                "secret": data.secret
            };
            ShowToast(`Detailize Successfully ${SettingName} ${user}@${domain}`, "info");
            // canvas
            PresentCanvas(userdata, domain, SettingName, 'PATCH');
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}

// -------------------------------------------------//
// --   Routing                                     //
// -------------------------------------------------//
function RoutingTablePresentData(data, presentation){
    let RoutingTablesHtml = EMPTYSTR;
    data.forEach((Rtable) => {
        let rtbName = Rtable.name;
        let rtbAction = Rtable.action;
        let rtbDesc = Rtable.desc;

        let newRecordButton = EMPTYSTR;
        if (rtbAction === 'query'){
            newRecordButton = `<button type="button" class="btn btn-outline-primary text-start" data-lsbc-action="create" data-lsbc-setting="RoutingRecord" data-lsbc-name="${LSBC.escapeAttr(rtbName)}"><i class="fa fa-plus-square-o"></i> Create Record</button>`;
        }

        rtblhtml = `
        <div class="accordion-item">
        <h2 class="accordion-header" data-bs-title="show detail">
          <button class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseRT${rtbName}">
            <span class="text-primary fw-bolder">${rtbName}</span> &nbsp;&nbsp;
            <span class="badge rounded-pill text-bg-danger">${rtbAction}</span> &nbsp;&nbsp; ${rtbDesc}</button>
        </h2>
        <div id="collapseRT${rtbName}" class="accordion-collapse collapse">
          <div class="accordion-body">
            <div class="row">
              <div class="col-md-4 col-lg-4">
                <div class="btn-group-vertical" role="group">
                  <button type="button" class="btn btn-outline-primary text-start" data-lsbc-action="load-routing-table" data-lsbc-name="${LSBC.escapeAttr(rtbName)}"><i class="fa fa-refresh"></i> Load Table</button>
                  <button type="button" class="btn btn-outline-primary text-start" data-lsbc-action="modify" data-lsbc-name="${LSBC.escapeAttr(rtbName)}" data-lsbc-setting="RoutingTable"><i class="fa fa-pencil-square-o"></i> Update Table</button>
                  <button type="button" class="btn btn-outline-danger text-start" data-lsbc-action="remove" data-lsbc-name="${LSBC.escapeAttr(rtbName)}" data-lsbc-setting="RoutingTable"><i class="fa fa-trash"></i> Delete Table</button>
                  ${newRecordButton}
                </div>
              </div>
              <div class="col-md-8 col-lg-8" id="DetailRT${rtbName}">
              </div>
            </div>
            <br>
            <div class="row" id="TableRR${rtbName}">
            </div>
          </div>
        </div>
        </div>`
        RoutingTablesHtml = RoutingTablesHtml + rtblhtml;
    });
    document.getElementById(presentation).innerHTML = RoutingTablesHtml;
}

function RoutingTableDetail(Rtablename){
    $.ajax({
        type: "GET",
        url: `/libreapi/routing/table/${Rtablename}`,
        success: function (data) {
            records = data.records;
            delete data['records'];
            document.getElementById(`DetailRT${Rtablename}`).innerHTML = `
            <div class="card border-primary">
              <div class="card-body text-primary">
                <pre><code>${JSON.stringify(data, undefined, 4)}</code></pre>
              </div>
            </div>`;
            // routing record
            let recordtable = EMPTYSTR;
            let cnt = 1;
            records.forEach((record)=>{
                let action = record.action;
                let match = record.match;
                let value = record.value;
                let primary = EMPTYSTR;
                let secondary = EMPTYSTR;
                let load = EMPTYSTR;
                if (action!=='block'){
                    primary = record.routes.primary;
                    secondary = record.routes.secondary;
                    load = record.routes.load;
                }
                recordhtml = `
                <tr>
                  <td>${cnt}</td> <td>${match}</td> <td>${value}</td> <td>${action}</td> <td>${primary}</td> <td>${secondary}</td> <td>${load}</td>
                  <td>
                    <button class="btn btn-danger btn-sm" type="button" data-lsbc-action="remove-routing-record" data-lsbc-name="${LSBC.escapeAttr(Rtablename)}" data-lsbc-match="${LSBC.escapeAttr(match)}" data-lsbc-value="${LSBC.escapeAttr(value)}"><i class="fa fa-times-circle"></i></button>
                    <button class="btn btn-success btn-sm" type="button" data-lsbc-action="update-routing-record" data-lsbc-name="${LSBC.escapeAttr(Rtablename)}" data-lsbc-match="${LSBC.escapeAttr(match)}" data-lsbc-value="${LSBC.escapeAttr(value)}" data-lsbc-rtaction="${LSBC.escapeAttr(action)}" data-lsbc-primary="${LSBC.escapeAttr(primary)}" data-lsbc-secondary="${LSBC.escapeAttr(secondary)}" data-lsbc-load="${LSBC.escapeAttr(load)}"><i class="fa fa-pencil"></i></button>
                  </td>
                </tr>`;
                recordtable = recordtable + recordhtml;
                cnt++;
            });
            if (records.length!==0){
                document.getElementById(`TableRR${Rtablename}`).innerHTML = `
                <table class="table table-bordered">
                <thead class="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Match</th>
                  <th scope="col">Value</th>
                  <th scope="col">Action</th>
                  <th scope="col">Primary</th>
                  <th scope="col">Secondary</th>
                  <th scope="col">Load</th>
                  <th scope="col"></th>
                </tr>
                </thead>
                  <tbody>
                  ${recordtable}
                  </tbody>
                </table>`;
            };
        },
        error: function(jqXHR) {
            document.getElementById("DetailRT"+Rtablename).innerHTML = EMPTYSTR;
            LSBC.ajaxError(jqXHR);
        }
    });
}

function RemoveRoutingRecord(tablename, match, value){
    let SettingName = 'RoutingRecord';
    let path = APIGuide[SettingName]['path']
    $.ajax({
        type: "DELETE",
        url: `${path}/${tablename}/${match}/${value}`,
        success: function (data) {
            ShowToast(`Delete Successfully ${SettingName} ${tablename} ${match} ${value}`, "info");
            RoutingTableDetail(tablename);
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}

function UpdateRoutingRecord(tablename, match, value, action, primary, secondary, load){
    let SettingName = 'RoutingRecord';
    let record = {
        "table": tablename,
        "match": match,
        "value": value,
        "action": action,
    }
    if (action!=='block'){
        record['routes'] = {
            "primary": primary,
            "secondary": secondary,
            "load": load
        }
    }
    ShowToast(`Detailize Successfully ${SettingName} ${tablename}`, "info");
    // canvas
    PresentCanvas(record, tablename, SettingName, 'PUT');
}

/* ----------------------- */
function PresentCanvas(Data, ObjectName, SettingName, method){
    ConfigDetailTextH.value = JSON.stringify(Data, undefined, 4);
    PanelLabelH.innerHTML = `${SettingName}  <strong><code>${ObjectName}</code></strong>`;
    ConfigSubmitBntH.dataset.lsbcAction = 'submit';
    ConfigSubmitBntH.dataset.lsbcName = ObjectName;
    ConfigSubmitBntH.dataset.lsbcSetting = SettingName;
    ConfigSubmitBntH.dataset.lsbcMethod = method;

    var OffCanvasHtml = document.getElementById("offcanvaspanel");
    offcanvaspanel = new bootstrap.Offcanvas(OffCanvasHtml);
    offcanvaspanel.show();
    LSBC.editor.mount(ConfigDetailTextH);
}

function PrettyCode(){ LSBC.editor.mount(ConfigDetailTextH); }

/* ---------------------------------------------------------------------------
    PROGRESS STATE
--------------------------------------------------------------------------- */
var ProgressDotELMS = document.getElementById('progessdot');
var ToastMsgEMLS = document.getElementById('toastmsg');

function ShowProgress(){
    ProgressDotELMS.classList.remove('invisible');
    setTimeout(function() {
        ProgressDotELMS.classList.add('invisible')
    },
    777);
}

LSBC.escapeAttr = function(val) {
    return String(val).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};

LSBC.ajaxError = function(jqXHR) {
    var msg = (jqXHR.responseJSON && jqXHR.responseJSON.detail) ? jqXHR.responseJSON.detail
            : (jqXHR.responseJSON && jqXHR.responseJSON.error) ? jqXHR.responseJSON.error
            : (jqXHR.statusText || 'Network error');
    ShowToast(msg, 'danger');
};

LSBC.confirm = function(message) {
    return new Promise(function(resolve) {
        document.getElementById('confirm-modal-body').textContent = message;
        var modal = new bootstrap.Modal(document.getElementById('confirm-modal'));
        document.getElementById('confirm-modal-ok').onclick = function() { modal.hide(); resolve(); };
        modal.show();
    });
};

LSBC._ajaxCount = 0;
$(document).ajaxStart(function() {
    LSBC._ajaxCount++;
    ProgressDotELMS.classList.remove('invisible');
}).ajaxStop(function() {
    LSBC._ajaxCount = 0;
    ProgressDotELMS.classList.add('invisible');
});

LSBC.filter = {
    attach: function(inputEl, tableId) {
        $(inputEl).on('input', function() {
            var q = this.value.toLowerCase();
            $('#' + tableId + ' tbody tr').each(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(q) > -1);
            });
            LSBC.paginate.attach(tableId, 25);
        });
    }
};

LSBC.editor = {
    _cm: null,
    mount: function(textareaEl) {
        var pendingValue = textareaEl.value;
        if (this._cm) { this._cm.toTextArea(); this._cm = null; }
        textareaEl.value = pendingValue;
        if (typeof CodeMirror === 'undefined') return;
        this._cm = CodeMirror.fromTextArea(textareaEl, {
            mode: 'application/json',
            theme: 'monokai',
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            lineWrapping: false,
            tabSize: 2
        });
        this._cm.on('change', function(cm) {
            var errEl = document.getElementById('cm-json-error');
            if (!errEl) return;
            try { JSON.parse(cm.getValue()); errEl.style.display = 'none'; }
            catch(e) { errEl.textContent = e.message; errEl.style.display = ''; }
        });
    },
    getValue: function() {
        return this._cm ? this._cm.getValue() : null;
    }
};

LSBC.paginate = {
    _state: {},
    attach: function(tableId, pageSize) {
        pageSize = pageSize || 25;
        var state = this._state[tableId] = { page: 0, size: pageSize };
        var self = this;
        function render() {
            $('#' + tableId + ' tbody tr[hidden]').removeAttr('hidden');
            var rows = $('#' + tableId + ' tbody tr').filter(function() {
                return $(this).css('display') !== 'none';
            });
            var total = rows.length;
            var pages = Math.max(1, Math.ceil(total / state.size));
            state.page = Math.min(state.page, pages - 1);
            rows.each(function(i) {
                if (!(i >= state.page * state.size && i < (state.page + 1) * state.size)) {
                    $(this).attr('hidden', '');
                }
            });
            var footerId = tableId + '-pagination';
            var footer = document.getElementById(footerId);
            if (!footer) return;
            footer.innerHTML = total <= state.size ? '' :
                '<div class="d-flex align-items-center gap-2 mt-1">' +
                '<button class="btn btn-sm btn-outline-secondary lsbc-page-prev" ' + (state.page === 0 ? 'disabled' : '') + '>&laquo;</button>' +
                '<span class="small">Page ' + (state.page + 1) + ' / ' + pages + ' (' + total + ' items)</span>' +
                '<button class="btn btn-sm btn-outline-secondary lsbc-page-next" ' + (state.page >= pages - 1 ? 'disabled' : '') + '>&raquo;</button>' +
                '</div>';
            $(footer).find('.lsbc-page-prev').off('click').on('click', function() { state.page--; render(); });
            $(footer).find('.lsbc-page-next').off('click').on('click', function() { state.page++; render(); });
        }
        render();
        return render;
    }
};

LSBC.autoRefresh = {
    _timers: {},
    start: function(key, fn, intervalMs) {
        this.stop(key);
        fn();
        var self = this;
        function tick() {
            if (!document.hidden) fn();
            self._timers[key] = setTimeout(tick, intervalMs);
        }
        this._timers[key] = setTimeout(tick, intervalMs);
    },
    stop: function(key) {
        if (this._timers[key]) { clearTimeout(this._timers[key]); delete this._timers[key]; }
    },
    stopAll: function() {
        var self = this;
        Object.keys(this._timers).forEach(function(k) { self.stop(k); });
    }
};

$(document).on('change', '#autorefresh-inbound', function() {
    localStorage.setItem('lsbc.ar.inbound', this.checked ? '1' : '0');
    if (this.checked) {
        var ms = parseInt($('#autorefresh-inbound-interval').val());
        LSBC.autoRefresh.start('inbound', function() { GeneralGetPresent('Inbound'); }, ms);
    } else {
        LSBC.autoRefresh.stop('inbound');
    }
}).on('change', '#autorefresh-inbound-interval', function() {
    localStorage.setItem('lsbc.ar.inbound.ms', this.value);
    if ($('#autorefresh-inbound').is(':checked')) {
        var ms = parseInt(this.value);
        LSBC.autoRefresh.start('inbound', function() { GeneralGetPresent('Inbound'); }, ms);
    }
}).on('change', '#autorefresh-outbound', function() {
    localStorage.setItem('lsbc.ar.outbound', this.checked ? '1' : '0');
    if (this.checked) {
        var ms = parseInt($('#autorefresh-outbound-interval').val());
        LSBC.autoRefresh.start('outbound', function() { GeneralGetPresent('Outbound'); }, ms);
    } else {
        LSBC.autoRefresh.stop('outbound');
    }
}).on('change', '#autorefresh-outbound-interval', function() {
    localStorage.setItem('lsbc.ar.outbound.ms', this.value);
    if ($('#autorefresh-outbound').is(':checked')) {
        var ms = parseInt(this.value);
        LSBC.autoRefresh.start('outbound', function() { GeneralGetPresent('Outbound'); }, ms);
    }
});

(function restoreAutoRefresh() {
    ['inbound','outbound'].forEach(function(dir) {
        var enabled = localStorage.getItem('lsbc.ar.' + dir) === '1';
        var ms = parseInt(localStorage.getItem('lsbc.ar.' + dir + '.ms') || '30000');
        if (enabled) {
            $('#autorefresh-' + dir).prop('checked', true);
            $('#autorefresh-' + dir + '-interval').val(ms);
            LSBC.autoRefresh.start(dir, function() { GeneralGetPresent(dir.charAt(0).toUpperCase() + dir.slice(1)); }, ms);
        }
    });
})();

$('[data-bs-toggle="tab"]').on('hide.bs.tab', function() {
    var target = $(this).attr('data-bs-target') || $(this).attr('href');
    if (target && target.indexOf('intcon') !== -1) {
        LSBC.autoRefresh.stop('inbound');
        LSBC.autoRefresh.stop('outbound');
        $('#autorefresh-inbound, #autorefresh-outbound').prop('checked', false);
    }
    if (target && target === '#nav-home') {
        LSBC.autoRefresh.stop('health');
    }
    if (target && target === '#nav-live-calls') {
        LSBC.autoRefresh.stop('live-calls');
    }
});

$(document).on('click', '.lsbc-gw-rescan', function() {
    var btn = $(this);
    var name = btn.data('lsbc-name');
    btn.prop('disabled', true).text('…');
    $.ajax({
        type: 'POST', url: '/libreapi/interconnection/' + encodeURIComponent(name) + '/rescan', global: false,
        success: function() {
            ShowToast('Rescan sent for ' + name, 'success');
            setTimeout(function() { enrichIntconStatus('outbound-intcon-table', 'outbound'); }, 1500);
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); },
        complete: function() { btn.prop('disabled', false).text('↺'); }
    });
});

$(document).on('click', '[data-lsbc-action]', function() {
    const action = $(this).data('lsbc-action');
    const name = $(this).data('lsbc-name');
    const setting = $(this).data('lsbc-setting');
    const method = $(this).data('lsbc-method');
    if (action === 'remove') LSBC.confirm('Delete ' + setting + ' "' + name + '"?').then(function() { GeneralRemove(name, setting); });
    if (action === 'modify') GeneralModify(name, setting);
    if (action === 'submit') GeneralSubmit(name, setting, method);
    if (action === 'remove-access-user') {
        const domain = $(this).data('lsbc-domain');
        LSBC.confirm('Delete user "' + name + '@' + domain + '"?').then(function() { RemoveAccessUser(domain, name); });
    }
    if (action === 'remove-routing-record') {
        const match = $(this).data('lsbc-match');
        const value = $(this).data('lsbc-value');
        LSBC.confirm('Delete routing record ' + match + '/' + value + '?').then(function() { RemoveRoutingRecord(name, match, value); });
    }
    if (action === 'load-users') { AccessUserDirectoryDetail(name); }
    if (action === 'load-policy') { AccessDomainPolicyDetail(name); }
    if (action === 'load-routing-table') { RoutingTableDetail(name); }
    if (action === 'create') { GeneralCreate(setting, name); }
    if (action === 'update-access-user') {
        const domain = $(this).data('lsbc-domain');
        UpdateAccessUser(domain, name);
    }
    if (action === 'update-routing-record') {
        const match = $(this).data('lsbc-match');
        const value = $(this).data('lsbc-value');
        const rtaction = $(this).data('lsbc-rtaction');
        const primary = $(this).data('lsbc-primary');
        const secondary = $(this).data('lsbc-secondary');
        const load = $(this).data('lsbc-load');
        UpdateRoutingRecord(name, match, value, rtaction, primary, secondary, load);
    }
});

function ShowToast(message, msgtype='danger'){
    ToastMsgEMLS.classList.remove('bg-danger','bg-success','bg-warning','bg-primary','bg-info');
    ToastMsgEMLS.classList.add('bg-' + msgtype);
    document.getElementById('event-message').textContent = message;
    $('.toast').toast('show');
}

// --------------------------------------------------
// CDR
// --------------------------------------------------

(function() {
    var input = document.getElementById('cdr-date-input');
    if (input) {
        var today = new Date().toISOString().slice(0, 10);
        input.value = today;
        input.max = today;
    }
})();

LSBC._cdrData = null;
LSBC._cdrSort = {col: null, dir: 1};

function _cdrSortVal(r, key, type) {
    var v;
    if (key === 'ring') { v = (r.answer_time && r.answer_time !== '0') ? parseInt(r.answer_time) - parseInt(r.start_time) : -1; }
    else if (key === 'pdd') { v = (r.progress_time && r.progress_time !== '0') ? parseInt(r.progress_time) - parseInt(r.start_time) : -1; }
    else if (key === 'route') { v = (r.from_intcon || '') + '>' + (r.to_intcon || ''); }
    else { v = r[key]; }
    return type === 'num' ? (parseInt(v) || 0) : (v || '').toString().toLowerCase();
}

function renderCDRRows(data, resetFilter) {
    var tbody = document.getElementById('cdr-table-body');
    var count = document.getElementById('cdr-count');
    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted">No records</td></tr>';
        if (count) count.textContent = '';
        return;
    }
    if (resetFilter && count) count.textContent = data.length + ' sessions';
    var rows = data.map(function(r) {
        var ts = r.start_time ? new Date(parseInt(r.start_time) * 1000) : null;
        var timeStr = ts ? ts.toLocaleTimeString() : '-';
        var dur = parseInt(r.duration) || 0;
        var durStr = Math.floor(dur / 60) + ':' + String(dur % 60).padStart(2, '0');
        var answered = r.answer_time && r.answer_time !== '0';
        var route = (r.from_intcon || '?') + ' → ' + (r.to_intcon || '?');
        var hangup = r.hangup_cause || '-';
        var hangupClass = hangup === 'NORMAL_CLEARING' ? 'text-muted' : 'text-danger fw-bold';
        var ringSecs = answered ? (parseInt(r.answer_time) - parseInt(r.start_time)) : null;
        var ringStr = ringSecs !== null ? ringSecs + 's' : '-';
        var pddSecs = (r.progress_time && r.progress_time !== '0') ? parseInt(r.progress_time) - parseInt(r.start_time) : null;
        var pddStr = pddSecs !== null && pddSecs >= 0 ? pddSecs + 's' : '-';
        var adv = ' cdr-col-adv d-none';
        return '<tr>' +
            '<td>' + LSBC.escapeAttr(timeStr) + '</td>' +
            '<td class="text-muted small' + adv + '">' + LSBC.escapeAttr(r.caller_name || '-') + '</td>' +
            '<td>' + LSBC.escapeAttr(r.caller_number || '-') + '</td>' +
            '<td>' + LSBC.escapeAttr(r.destination_number || '-') + '</td>' +
            '<td class="text-nowrap small">' + LSBC.escapeAttr(route) + '</td>' +
            '<td class="text-nowrap small">' + LSBC.escapeAttr(r.gateway || '-') + '</td>' +
            '<td class="text-muted small' + adv + '">' + LSBC.escapeAttr(r.sipprofile || '-') + '</td>' +
            '<td class="text-muted">' + LSBC.escapeAttr(ringStr) + '</td>' +
            '<td class="text-muted' + adv + '">' + LSBC.escapeAttr(pddStr) + '</td>' +
            '<td>' + (answered ? durStr : '<span class="text-warning">no answer</span>') + '</td>' +
            '<td class="' + hangupClass + '">' + LSBC.escapeAttr(hangup) + '</td>' +
            '<td class="text-muted small' + adv + '">' + LSBC.escapeAttr(r.hangup_disposition || '-') + '</td>' +
            '<td class="text-muted small' + adv + '">' + LSBC.escapeAttr(r.codec || '-') + '</td>' +
            '<td class="text-muted small' + adv + '">' + LSBC.escapeAttr(r.sip_hangup_cause || '-') + '</td>' +
            '<td class="text-muted small' + adv + '">' + LSBC.escapeAttr(r.libre_hangup_cause || '-') + '</td>' +
            '</tr>';
    });
    tbody.innerHTML = rows.join('');
    $('#cdr-table tbody .cdr-col-adv').toggleClass('d-none', !$('#cdr-advanced').is(':checked'));
    var q = resetFilter ? '' : ($('#cdr-filter').val() || '').toLowerCase();
    if (resetFilter) { $('#cdr-filter').val(''); }
    else if (q) {
        $('#cdr-table tbody tr').each(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(q) > -1);
        });
    }
    if (!LSBC._cdrFilterAttached) {
        LSBC.filter.attach('#cdr-filter', 'cdr-table');
        $('#cdr-advanced').on('change', function() {
            $('#cdr-table .cdr-col-adv').toggleClass('d-none', !this.checked);
        });
        $('#cdr-table thead').on('click', 'th[data-cdr-key]', function() {
            var $th = $(this);
            var key = $th.data('cdr-key');
            var type = $th.data('cdr-type') || 'str';
            LSBC._cdrSort.dir = LSBC._cdrSort.col === key ? LSBC._cdrSort.dir * -1 : 1;
            LSBC._cdrSort.col = key;
            var dir = LSBC._cdrSort.dir;
            $('#cdr-table thead th').removeClass('cdr-sort-asc cdr-sort-desc');
            $th.addClass(dir === 1 ? 'cdr-sort-asc' : 'cdr-sort-desc');
            var sorted = (LSBC._cdrData || []).slice().sort(function(a, b) {
                var va = _cdrSortVal(a, key, type), vb = _cdrSortVal(b, key, type);
                return va < vb ? -dir : va > vb ? dir : 0;
            });
            renderCDRRows(sorted, false);
        });
        $('#cdr-table thead th[data-bs-toggle="tooltip"]').each(function() {
            new bootstrap.Tooltip(this);
        });
        LSBC._cdrFilterAttached = true;
    }
    LSBC.paginate.attach('cdr-table', 100);
}

function loadCDR() {
    var input = document.getElementById('cdr-date-input');
    var date = input ? input.value : new Date().toISOString().slice(0, 10);
    $.ajax({
        type: 'GET',
        url: '/libreapi/cdr/records?date=' + encodeURIComponent(date) + '&limit=2000',
        success: function(data) {
            LSBC._cdrData = data;
            LSBC._cdrSort = {col: null, dir: 1};
            $('#cdr-table thead th').removeClass('cdr-sort-asc cdr-sort-desc');
            renderCDRRows(data, true);
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}

// --------------------------------------------------
// Live Channels
// --------------------------------------------------

function loadActiveChannels() {
    $.ajax({
        type: 'GET',
        url: '/libreapi/calls/active',
        success: function(data) {
            var tbody = document.getElementById('live-calls-body');
            var count = document.getElementById('live-calls-count');
            if (!Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No active channels</td></tr>';
                if (count) count.textContent = '';
                return;
            }
            if (count) count.textContent = data.length + ' channel' + (data.length === 1 ? '' : 's');
            tbody.innerHTML = data.map(function(ch) {
                var dur = parseInt(ch.duration) || 0;
                var durStr = Math.floor(dur / 60) + ':' + String(dur % 60).padStart(2, '0');
                var stateClass = ch.callstate === 'ACTIVE' ? 'text-success' : 'text-warning';
                return '<tr>' +
                    '<td>' + LSBC.escapeAttr(ch.caller || '-') + '</td>' +
                    '<td>' + LSBC.escapeAttr(ch.destination || '-') + '</td>' +
                    '<td>' + durStr + '</td>' +
                    '<td class="' + stateClass + ' small">' + LSBC.escapeAttr(ch.callstate || '-') + '</td>' +
                    '<td class="small">' + LSBC.escapeAttr(ch.direction || '-') + '</td>' +
                    '<td class="font-monospace small text-muted">' + LSBC.escapeAttr(ch.uuid || '-') + '</td>' +
                    '</tr>';
            }).join('');
        },
        error: function(jqXHR) { LSBC.ajaxError(jqXHR); }
    });
}
