import React from 'react';
import underscore from 'underscore';

import ApiMixin from '../mixins/apiMixin';
import IndicatorStore from '../stores/indicatorStore';
import ListLink from '../components/listLink';
import PluginList from '../components/pluginList';
import {FormState, RangeField, TextField} from '../components/forms';
import {t, tct} from '../locale';

const DigestSettings = React.createClass({
  propTypes: {
    orgId: React.PropTypes.string.isRequired,
    projectId: React.PropTypes.string.isRequired,
    initialData: React.PropTypes.object,
    onSave: React.PropTypes.func.isRequired
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      formData: Object.assign({}, this.props.initialData),
      errors: {}
    };
  },

  onFieldChange(name, value) {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    });
  },

  onSubmit(e) {
    e.preventDefault();

    if (this.state.state == FormState.SAVING) {
      return;
    }
    this.setState(
      {
        state: FormState.SAVING
      },
      () => {
        let loadingIndicator = IndicatorStore.add(t('Saving changes..'));
        let {orgId, projectId} = this.props;
        this.api.request(`/projects/${orgId}/${projectId}/`, {
          method: 'PUT',
          data: this.state.formData,
          success: data => {
            this.props.onSave(data);
            this.setState({
              state: FormState.READY,
              errors: {}
            });
          },
          error: error => {
            this.setState({
              state: FormState.ERROR,
              errors: error.responseJSON
            });
          },
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          }
        });
      }
    );
  },

  render() {
    let isSaving = this.state.state === FormState.SAVING;
    let {errors, formData} = this.state;
    let hasChanges = !underscore.isEqual(this.props.initialData, formData);
    return (
      <div className="box">
        <div className="box-header">
          <h3>{t('Digests')}</h3>
        </div>
        <div className="box-content with-padding">
          <p>
            {t(
              'Sentry will automatically digest alerts sent ' +
                'by some services to avoid flooding your inbox ' +
                'with individual issue notifications. To control ' +
                'how frequently notifications are delivered, use ' +
                'the sliders below.'
            )}
          </p>
          <form onSubmit={this.onSubmit} className="form-stacked">
            {this.state.state === FormState.ERROR &&
              <div className="alert alert-error alert-block">
                {t(
                  'Unable to save your changes. Please ensure all fields are valid and try again.'
                )}
              </div>}
            <div className="row">
              <div className="col-md-6">
                <RangeField
                  min={60}
                  max={3600}
                  step={60}
                  defaultValue={300}
                  label={t('Minimum delivery interval')}
                  help={t('Notifications will be delivered at most this often.')}
                  name="digestsMinDelay"
                  value={formData.digestsMinDelay}
                  error={errors.digestsMinDelay}
                  formatLabel={RangeField.formatMinutes}
                  onChange={this.onFieldChange.bind(this, 'digestsMinDelay')}
                />
              </div>
              <div className="col-md-6">
                <RangeField
                  min={60}
                  max={3600}
                  step={60}
                  defaultValue={3600}
                  label={t('Maximum delivery interval')}
                  help={t('Notifications will be delivered at least this often.')}
                  name="digestsMaxDelay"
                  value={formData.digestsMaxDelay}
                  error={errors.digestsMaxDelay}
                  formatLabel={RangeField.formatMinutes}
                  onChange={this.onFieldChange.bind(this, 'digestsMaxDelay')}
                />
              </div>
            </div>

            <fieldset className="form-actions align-right">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || !hasChanges}>
                {t('Save Changes')}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    );
  }
});

const GeneralSettings = React.createClass({
  propTypes: {
    orgId: React.PropTypes.string.isRequired,
    projectId: React.PropTypes.string.isRequired,
    initialData: React.PropTypes.object,
    onSave: React.PropTypes.func.isRequired
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      formData: Object.assign({}, this.props.initialData),
      errors: {}
    };
  },

  onFieldChange(name, value) {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      }
    });
  },

  onSubmit(e) {
    e.preventDefault();

    if (this.state.state == FormState.SAVING) {
      return;
    }
    this.setState(
      {
        state: FormState.SAVING
      },
      () => {
        let loadingIndicator = IndicatorStore.add(t('Saving changes..'));
        let {orgId, projectId} = this.props;
        this.api.request(`/projects/${orgId}/${projectId}/`, {
          method: 'PUT',
          data: this.state.formData,
          success: data => {
            this.props.onSave(data);
            this.setState({
              state: FormState.READY,
              errors: {}
            });
          },
          error: error => {
            this.setState({
              state: FormState.ERROR,
              errors: error.responseJSON
            });
          },
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          }
        });
      }
    );
  },

  render() {
    let isSaving = this.state.state === FormState.SAVING;
    let {errors, formData} = this.state;
    let hasChanges = !underscore.isEqual(this.props.initialData, formData);
    return (
      <div className="box">
        <div className="box-header">
          <h3>{t('Email Settings')}</h3>
        </div>

        <div className="box-content with-padding">
          <form onSubmit={this.onSubmit} className="form-stacked">
            {this.state.state === FormState.ERROR &&
              <div className="alert alert-error alert-block">
                {t(
                  'Unable to save your changes. Please ensure all fields are valid and try again.'
                )}
              </div>}

            <TextField
              key="subjectTemplate"
              label={t('Subject template')}
              value={formData.subjectTemplate}
              required={false}
              error={errors.subjectTemplate}
              onChange={this.onFieldChange.bind(this, 'subjectTemplate')}
              help="The email subject to use (excluding the prefix) for individual alerts. Usable variables include: $project, $title, and ${tag:key}, such as ${tag:environment} or ${tag:release}."
            />

            <fieldset className="form-actions align-right">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || !hasChanges}>
                {t('Save Changes')}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    );
  }
});

const ProjectAlertSettings = React.createClass({
  propTypes: {
    // these are not declared as required of issues with cloned elements
    // not initially defining them (though they are bound before) ever
    // rendered
    organization: React.PropTypes.object,
    project: React.PropTypes.object
  },

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      error: false,
      pluginList: []
    };
  },

  componentDidMount() {
    this.fetchData();
  },

  fetchData() {
    let {orgId, projectId} = this.props.params;
    this.api.request(`/projects/${orgId}/${projectId}/plugins/`, {
      success: (data, _, jqXHR) => {
        this.setState({
          error: false,
          loading: false,
          pluginList: data.filter(p => p.type === 'notification')
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false
        });
      }
    });
  },

  onDigestsChange(data) {
    // TODO(dcramer): propagate this in a more correct way
    this.setState({
      project: {
        ...this.state.project,
        digestsMinDelay: data.digestsMinDelay,
        digestsMaxDelay: data.digestsMaxDelay
      }
    });
  },

  onGeneralChange(data) {
    // TODO(dcramer): propagate this in a more correct way
    this.setState({
      project: {
        ...this.state.project,
        subjectTemplate: data.subjectTemplate
      }
    });
  },

  onEnablePlugin(plugin) {
    this.setState({
      pluginList: this.state.pluginList.map(p => {
        if (p.id !== plugin.id) return p;
        return {
          ...plugin,
          enabled: true
        };
      })
    });
  },

  onDisablePlugin(plugin) {
    this.setState({
      pluginList: this.state.pluginList.map(p => {
        if (p.id !== plugin.id) return p;
        return {
          ...plugin,
          enabled: false
        };
      })
    });
  },

  render() {
    let {orgId, projectId} = this.props.params;
    let {organization, project} = this.props;
    let {pluginList} = this.state;
    return (
      <div>
        <a
          href={`/${orgId}/${projectId}/settings/alerts/rules/new/`}
          className="btn pull-right btn-primary btn-sm">
          <span className="icon-plus" />
          {t('New Alert Rule')}
        </a>
        <h2>{t('Alerts')}</h2>

        <ul className="nav nav-tabs" style={{borderBottom: '1px solid #ddd'}}>
          <ListLink to={`/${orgId}/${projectId}/settings/alerts/`} index={true}>
            {t('Settings')}
          </ListLink>
          <ListLink to={`/${orgId}/${projectId}/settings/alerts/rules/`}>
            {t('Rules')}
          </ListLink>
        </ul>

        <div className="alert alert-block alert-info">
          {tct(
            "These settings cover rule-based alerts. If you're " +
              'looking to change which notifications you receive ' +
              'you may do so from your [link:account settings].',
            {
              link: <a href="/account/settings/notifications/" />
            }
          )}
        </div>

        <GeneralSettings
          orgId={orgId}
          projectId={projectId}
          initialData={{
            subjectTemplate: project.subjectTemplate
          }}
          onSave={this.onGeneralChange}
        />

        <DigestSettings
          orgId={orgId}
          projectId={projectId}
          initialData={{
            digestsMinDelay: project.digestsMinDelay,
            digestsMaxDelay: project.digestsMaxDelay
          }}
          onSave={this.onDigestsChange}
        />

        <PluginList
          organization={organization}
          project={project}
          pluginList={pluginList}
          onEnablePlugin={this.onEnablePlugin}
          onDisablePlugin={this.onDisablePlugin}
        />
      </div>
    );
  }
});

export default ProjectAlertSettings;
