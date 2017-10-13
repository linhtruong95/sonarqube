/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { memoize } from 'lodash';
import { Plugin, PluginAvailable, PluginInstalled, PluginPending } from '../../api/plugins';
import { cleanQuery, parseAsString, RawQuery, serializeString } from '../../helpers/query';

export interface Query {
  filter: string;
  search?: string;
}

export const DEFAULT_FILTER = 'all';

export function isPluginAvailable(plugin: Plugin): plugin is PluginAvailable {
  return (plugin as any).release !== undefined;
}

export function isPluginInstalled(plugin: Plugin): plugin is PluginInstalled {
  return isPluginPending(plugin) && (plugin as any).updatedAt !== undefined;
}

export function isPluginPending(plugin: Plugin): plugin is PluginPending {
  return (plugin as any).version !== undefined;
}

export function isEditionPlugin(plugin: Plugin): boolean {
  // TODO Remove to use the flag supposed to be returned by ws when SONAR-9976 is done
  return (
    (plugin.organizationName || '').toLowerCase() === 'sonarsource' &&
    (plugin.license || '').toLowerCase() === 'sonarsource'
  );
}

export function filterPlugins(plugins: Plugin[], search: string): Plugin[] {
  const s = search.toLowerCase();
  return plugins.filter(plugin => {
    return (
      plugin.name.toLowerCase().includes(s) ||
      plugin.description.toLowerCase().includes(s) ||
      (plugin.category || '').toLowerCase().includes(s)
    );
  });
}

export const parseQuery = memoize((urlQuery: RawQuery): Query => ({
  filter: parseAsString(urlQuery['filter']) || DEFAULT_FILTER,
  search: parseAsString(urlQuery['search'])
}));

export const serializeQuery = memoize((query: Query): RawQuery =>
  cleanQuery({
    filter: query.filter === DEFAULT_FILTER ? undefined : serializeString(query.filter),
    search: query.search ? serializeString(query.search) : undefined
  })
);
